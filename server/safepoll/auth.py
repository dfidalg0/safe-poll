from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.status import HTTP_401_UNAUTHORIZED

from api.models import UserAccount
from google.oauth2 import id_token
from google.auth.transport import requests

@api_view(['POST'])
def google(req: Request) -> Response:
    token = req.data['token']

    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(),
            '109753109659-lafbr7ekvdg3o245rq4a2bjbkag0j6tr.apps.googleusercontent.com'
        )

        email = idinfo['email']
        name = ' '.join([idinfo['given_name'], idinfo['family_name']])

        user = UserAccount.objects.filter(email=email)

        if not user:
            user = UserAccount.objects.create_user(email, name)
        else:
            user = user.get()
            if user.password is not None:
                return Reponse({
                    message: 'Usuário já existente'
                }, status=HTTP_401_UNAUTHORIZED)

        refresh: RefreshToken = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
    except:
        return Response({
            'message': 'Token de login inválido'
        }, status=HTTP_401_UNAUTHORIZED)
