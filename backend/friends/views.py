from django.contrib.sessions.models import Session
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from user_auth.models import User
from .models import FriendRequest
from .serializers import FriendRequestSerializer
from django.http import JsonResponse
from user_auth import serializers as UserSerializer
from notifications.models import Notification

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    try:
        to_user = User.objects.get(username=request.data['to_user'])
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)

    # Verificar si los usuarios ya son amigos
    if request.user.friends.filter(id=to_user.id).exists():
        return Response({'message': 'You are already friends'}, status=400)
    
    if request.user == to_user:
        return Response({'message': 'You cannot send a friend request to yourself'}, status=400)

    # Verificar si ya existe una solicitud de amistad pendiente
    if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
        return Response({'message': 'Friend request already sent'}, status=400)
    if FriendRequest.objects.filter(from_user=to_user, to_user=request.user).exists():
        return Response({'message': 'Friend request already received'}, status=400)

    friend_request = FriendRequest(from_user=request.user, to_user=to_user)
    if friend_request.send_friend_request(to_user):
        # Crear notificación para el usuario destinatario
        notification_message = f'{request.user.username} te ha enviado una solicitud de amistad.'
        Notification.objects.create(user=to_user, message=notification_message, type="friend")
        return Response({'message': 'Friend request sent'})
    return Response({'message': 'Friend request could not be sent'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request):
    try:
        from_user = User.objects.get(id=request.data['id'])
    
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=request.user)
        if friend_request.accept_friend_request():
            # Crear notificaciones para ambos usuarios
            notification_message_to_user = f'{request.user} ha aceptado tu solicitud de amistad.'
            Notification.objects.create(user=from_user, message=notification_message_to_user, type="friend")

            return Response({'message': 'Friend request accepted'})
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)
    except FriendRequest.DoesNotExist:
        return Response({'message': 'Friend request not found'}, status=400)
    return Response({'message': 'Friend request not found'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friends(request):
    try:
        friends = request.user.friends.all().values('id', 'username')  # Ajusta los campos según sea necesario
        friends_list = list(friends)
        return JsonResponse(friends_list, safe=False)
    except User.DoesNotExist:
        return JsonResponse({'message': 'User does not exist'}, status=404)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sent_friend_requests(request):
    sent_requests = FriendRequest.objects.filter(from_user=request.user)
    response_data = [
        {
            'id': friend_request.to_user.id,
            'username': friend_request.to_user.username
        }
        for friend_request in sent_requests
    ]
    return JsonResponse(response_data, status=200, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_received_friend_requests(request):
    received_requests = FriendRequest.objects.filter(to_user=request.user)
    response_data = [
        {
            'id': friend_request.from_user.id,
            'username': friend_request.from_user.username
        }
        for friend_request in received_requests
    ]
    return JsonResponse(response_data, status=200, safe=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_friend_request(request):
    id = request.data.get('id')
    if not id:
        return Response({'message': 'ID is required'}, status=400)

    try:
        from_user = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)
    
    try:
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=request.user)
        friend_request.delete()
        return Response({'message': 'Friend request rejected'})
    except:
        return Response({'message': 'Friend request does not exist'}, status=404)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_friend_request(request):
    id = request.data.get('id')
    if not id:
        return Response({'message': 'ID is required'}, status=400)

    try:
        to_user = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)

    try:
        friend_request = FriendRequest.objects.get(from_user=request.user, to_user=to_user)
        friend_request.delete()
        return Response({'message': 'Friend request cancelled'})
    except FriendRequest.DoesNotExist:
        return Response({'message': 'Friend request does not exist'}, status=404)