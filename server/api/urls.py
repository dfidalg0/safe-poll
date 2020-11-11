from .views import (HelloWorld, send_emails, send_group_emails)
from django.urls import path

urlpatterns = [
    path('hello', HelloWorld),
    path('send-emails', send_emails),
    path('send-group-emails', send_group_emails)
]
