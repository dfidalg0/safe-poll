from .views import (HelloWorld, send_individual_email, send_group_emails)
from django.urls import path

urlpatterns = [
    path('hello/', HelloWorld),
    path('send-individual-email/<int:poll_id>/<int:user_id>', send_individual_email),
    path('send-group-emails/<int:poll_id>/', send_group_emails)
]
