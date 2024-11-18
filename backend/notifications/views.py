from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .models import Notification

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    notifications = Notification.objects.filter(user=request.user)
    response_data = [
        {
            'id': notification.id,
            'message': notification.message,
            'time': notification.timestamp,
            'type': notification.type
        }
        for notification in notifications
    ]
    return JsonResponse(response_data, status=200, safe=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request):
    notification_id = request.data.get('notificationId')
    if not notification_id:
        return JsonResponse({'error': 'ID is required'}, status=400)
    
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.delete()
        return JsonResponse({'message': 'Notification marked as read'}, status=200)
    except Notification.DoesNotExist:
        return JsonResponse({'error': 'Notification not found'}, status=404)