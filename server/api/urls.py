from .views import *
from django.urls import path
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('hello', HelloView.as_view()),
    path('poll/send-list-emails', send_list_emails),
    path('poll/send-poll-emails', send_poll_emails),
    path('poll/create', create_poll),
    path('poll/return-result', return_result),
    path('tokens/create', register_emails),
    path('tokens/create_from_group', register_emails_from_group),
    path('vote/compute', compute_vote)
]
