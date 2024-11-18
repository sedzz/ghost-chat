from django.urls import path
from . import views

urlpatterns = [
    path('create-chat-room/', views.create_chat_room),
    path('get-rooms/', views.get_chat_rooms),
    path('room/<str:hash_id>/', views.get_chat_room, name='get_chat_room'),
    path('room/<str:hash_id>/delete/', views.delete_chat_room, name='delete_chat_room'),

]