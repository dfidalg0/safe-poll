from .views import *
from django.urls import path
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('hello', HelloView.as_view()),
]


