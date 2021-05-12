from .views import *
from django.urls import path
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    # Padrão -> /api/<nome do recurso>/<operação>

    path('polls/get/<int:pk>/', get_poll),
    path('polls/create', create_poll),
    path('polls/update/<int:pk>', update_poll),
    path('polls/delete/<int:pk>/', delete_poll),
    path('polls/mine', get_user_polls),
    path('polls/get/<int:pk>/result', get_poll_result),
    path('polls/emails/<int:pk>', get_emails_from_poll),
    path('polls/emails/delete', delete_email_from_poll),
    path('polls/<int:pk>/permanent-token/get', get_permanent_token),
    path('polls/<int:pk>/permanent-token/set', gen_permanent_token),
    path('polls/<int:pk>/permanent-token/delete', delete_permanent_token),

    path('emails/send', send_poll_emails),
    path('emails/send-list', send_list_emails),

    path('groups/get/<int:pk>', get_group),
    path('groups/update/<int:pk>', update_group),
    path('groups/create', create_group),
    path('groups/delete/<int:pk>', delete_group),
    path('groups/mine', user_groups),

    path('tokens/create', register_emails),
    path('tokens/create-from-group', register_emails_from_group),

    path('votes/compute', compute_vote),
    path('votes/get/<int:pk>', get_poll_votes),
    path('votes/export/<int:pk>', export_votes),

    path('users/reset_password', CustomResetPasswordView.as_view({'post': 'reset_password'})),
    path('users/reset_password_confirm', CustomResetPasswordView.as_view({'post': 'reset_password_confirm'})),
]
