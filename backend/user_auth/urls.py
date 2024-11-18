from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
    path('check-auth/', views.check_auth, name='check-auth'),
    path('check-full-auth/', views.check_full_auth, name='check-full-auth'),
    path('logout', views.logout, name='logout'),
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('change-password', views.change_password, name='change-password'),
]