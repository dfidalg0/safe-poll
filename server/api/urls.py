from .views import *
from django.urls import path
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('hello', HelloView.as_view()),
    path('poll/create', create_poll),
    path('group/create', create_group),
    path('groups/mine', user_groups),
    path('tokens/create', register_emails),
    path('tokens/create_from_group', register_emails_from_group),
    path('vote/compute', compute_vote),
    path('polls/mine', user_polls),
    path('polls/options/<int:pk>/', poll_options)
]
