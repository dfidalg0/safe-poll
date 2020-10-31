from .views import HelloWorld
from django.urls import path, include

urlpatterns = [
    path('hello', HelloWorld)
]
