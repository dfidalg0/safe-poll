from rest_framework.decorators import action

from djoser.compat import get_user_email
from djoser.conf import settings
from rest_framework import status
from django.utils.timezone import now
from rest_framework.response import Response
from django.utils import translation

from djoser import views

class CustomResetPasswordView(views.UserViewSet):
    @action(["post"], detail=False)
    def reset_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
    
        user = serializer.get_user()

        if user:
            context = {"user": user}
            to = [get_user_email(user)]
            with translation.override(request.data['language']):
                settings.EMAIL.password_reset(self.request, context).send(to)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(["post"], detail=False)
    def reset_password_confirm(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.user.set_password(serializer.data["new_password"])
        if hasattr(serializer.user, "last_login"):
            serializer.user.last_login = now()
        serializer.user.save()

        if settings.PASSWORD_CHANGED_EMAIL_CONFIRMATION:
            context = {"user": serializer.user}
            to = [get_user_email(serializer.user)]
            with translation.override(request.data['language']):
                settings.EMAIL.password_changed_confirmation(self.request, context).send(to)
        return Response(status=status.HTTP_204_NO_CONTENT)