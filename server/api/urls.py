from .views import *
from django.urls import path
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('hello', HelloView.as_view()),
    path('send-individual-email/<int:poll_id>/<int:user_id>', send_individual_email),
    path('send-group-emails/<int:poll_id>/', send_group_emails),
    path('poll/create', create_poll),
    path('tokens/create', register_emails),
    path('tokens/create_from_group', register_emails_from_group),
    path('vote/compute', compute_vote)
]
