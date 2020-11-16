from django.http import JsonResponse
from random import randint
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from random import randint

# Create your views here.

# view em que o usuário precisa estar logado
class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        content = {'message': f'Hello, {user.get_full_name()}! {randint(0, 100)}'}
        return Response(content)