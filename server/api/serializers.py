from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from api.models import Token
User = get_user_model()


class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'name', 'password')

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token 
        fields = ['id', 'token', 'poll', 'user']
