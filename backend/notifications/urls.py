from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_notifications),
    path('mark-as-read', views.mark_notification_as_read),
]