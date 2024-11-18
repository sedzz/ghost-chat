from django.urls import path, include

urlpatterns = [
    path('auth/', include('user_auth.urls')),
    path('friends/', include('friends.urls')),
    path('chat/', include('chat.urls')),
    path('notifications/', include('notifications.urls')),
]