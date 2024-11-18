from django.urls import path
from . import views

urlpatterns = [
    path('send-friend-request', views.send_friend_request, name='send_friend_request'),
    path('accept-friend-request', views.accept_friend_request, name='accept_friend_request'),
    path('list-friends', views.list_friends, name='list_friends'),
    path('list-sent-friend-requests', views.list_sent_friend_requests, name='list_sent_friend_requests'),
    path('list-received-friend-requests', views.list_received_friend_requests, name='list_received_friend_requests'),
    path('reject-friend-request', views.reject_friend_request, name='reject_friend_request'),
    path('cancel-friend-request', views.cancel_friend_request, name='cancel_friend_request'),
]