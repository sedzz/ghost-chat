from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ChatRoom
from user_auth.models import User
from notifications.models import Notification

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat_room(request):
    room_name = request.data.get('room_name')
    other_user_id = request.data.get('other_user_id')

    if not room_name or not other_user_id:
        return Response({'error': 'Room name and other user ID are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    chat_room = ChatRoom.objects.create(name=room_name)
    chat_room.users.add(request.user, other_user)
    chat_room.save()

    # Crear notificación para el otro usuario
    notification_message = f'{request.user.username} ha creado una nueva sala de chat contigo: {room_name}.'
    Notification.objects.create(user=other_user, message=notification_message, type="chat_room")

    return JsonResponse({'chat_room': chat_room.hash_id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_rooms(request):
    chat_rooms = ChatRoom.objects.filter(users__in=[request.user])
    return JsonResponse({'chat_rooms': [{'name': chat_room.name, 'hash_id': chat_room.hash_id} for chat_room in chat_rooms]}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_room(request, hash_id):
    try:
        room = ChatRoom.objects.get(hash_id=hash_id, users__in=[request.user])
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Chat room not found'}, status=status.HTTP_403_FORBIDDEN)
    
    return JsonResponse({'chat_room': {'name': room.name, 'hash_id': room.hash_id}}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat_room(request, hash_id):
    try:
        room = ChatRoom.objects.get(hash_id=hash_id, users__in=[request.user])
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Chat room not found'}, status=status.HTTP_403_FORBIDDEN)

    # Crear notificaciones para ambos usuarios
    users = room.users.all()
    for user in users:
        notification_message = f'La sala de chat "{room.name}" ha sido eliminada.'
        Notification.objects.create(user=user, message=notification_message, type="chat_room")

    room.delete()
    return Response({'message': 'Chat room deleted'}, status=status.HTTP_200_OK)