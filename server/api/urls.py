from .views import HelloWorld
from django.urls import path

urlpatterns = [
    path('hello', HelloWorld)
]
