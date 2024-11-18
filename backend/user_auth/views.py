import threading
from django.contrib.sessions.models import Session
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import UserSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import login as auth_login, logout as auth_logout
from rest_framework import status
from .models import User
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password

from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str, DjangoUnicodeDecodeError

from .utils import generate_token
from django.core.mail import EmailMessage
from django.conf import settings
from django.shortcuts import render
from notifications.models import Notification


class EmailThread(threading.Thread):
    def __init__(self,email):
        self.email=email
        threading.Thread.__init__(self)

    def run(self):
        self.email.send()


def send_activation_email(user,request):
    current_site = get_current_site(request)
    email_subject = 'Activate your account'
    email_body = render_to_string('authentication/activate.html',{
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': generate_token.make_token(user)
    })

    email = EmailMessage(subject=email_subject, body=email_body, from_email= settings.EMAIL_FROM_USER, to=[user.email])

    EmailThread(email).start()


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.is_email_verified:
        return Response({'error': 'Email is not verified, please check your email inbox'}, status=status.HTTP_400_BAD_REQUEST)

    # Verifica que el password proporcionado coincida con el del usuario encontrado
    if check_password(password, user.password):
        auth_login(request, user)  # Inicia la sesión del usuario
        session_key = request.session.session_key
        response = JsonResponse({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username
            },
        }, status=status.HTTP_200_OK)
        response.set_cookie(key='sessionid', value=session_key, httponly=True, secure=True)
        return response
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register(request):

    try:

        if User.objects.filter(email=request.data['email']).exists():
            return Response({'error': 'An account with that email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=request.data['username']).exists():
            return Response({'error': 'An account with that username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(serializer.data['password'])
            user.save()

            send_activation_email(user, request)  # Envía un correo de activación al usuario

            notification_message = f'Bienvenido, {user.username}! A que espera para empezar a chatear?'
            Notification.objects.create(user=user, message=notification_message, type="welcome")

            return Response({'user': serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    # Verifica si el usuario tiene una sesión activa usando el modelo Session
    session_key = request.COOKIES.get('sessionid')
    if session_key and Session.objects.filter(session_key=session_key).exists():
        session = Session.objects.get(session_key=session_key)
        user_id = session.get_decoded().get('_auth_user_id')
        user = get_object_or_404(User, id=user_id)
        user_data = {
            'username': user.username
        }
        return JsonResponse({'user': user_data}, status=status.HTTP_200_OK)
    return JsonResponse(status=status.HTTP_401_UNAUTHORIZED)

api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_full_auth(request):
    
    session_key = request.COOKIES.get('sessionid')
    if session_key and Session.objects.filter(session_key=session_key).exists():
        session = Session.objects.get(session_key=session_key)
        user_id = session.get_decoded().get('_auth_user_id')
        user = get_object_or_404(User, id=user_id)
        user_data = {
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
        }
        return JsonResponse({'user': user_data}, status=status.HTTP_200_OK)
    return JsonResponse(status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def activate(request, uidb64, token):
    try:
        uid=force_str(urlsafe_base64_decode(uidb64))

        user = User.objects.get(pk=uid)
    except Exception:
        user=None
    
    if user and generate_token.check_token(user,token):
        user.is_email_verified=True
        user.save()
        return render(request, 'authentication/activation_success.html')
    
    return render(request, 'authentication/activation_invalid.html')

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:

        user = request.user
        old_password = request.data.get('oldPassword')
        new_password = request.data.get('newPassword')

        if not old_password or not new_password:
            return Response({'error': 'Both old and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(old_password, user.password):
            return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()

        notification_message = f'Tu contraseña ha sido cambiada exitosamente!'
        Notification.objects.create(user=user, message=notification_message, type="welcome")
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def logout(request):
    auth_logout(request)
    response = JsonResponse({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    response.delete_cookie('sessionid')
    return response