from django.http import JsonResponse
from random import randint
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from random import randint

# Create your views here.

class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {'message': f'Hello, {randint(0, 100)}!'}
        return Response(content)