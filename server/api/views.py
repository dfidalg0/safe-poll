from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from random import randint
from .models import Poll, Option
import jwt


# Create your views here.

# view em que o usuário precisa estar logado
class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        content = {'message': f'Hello, {user.get_full_name()}! {randint(0, 100)}'}
        return Response(content)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_poll(request):
    data = request.data

    token = request.headers["Authorization"][4:]
    data["admin_id"] = jwt.decode(token)["user_id"]

    options = data["options"]
    del data["options"]

    poll = Poll.objects.create(**data)
    objects = []

    for option in options:
        objects.append(Option(name=option, description='', poll=poll))

    Option.objects.bulk_create(objects)

    conclusion = {'id': poll.id}
    return Response(conclusion)
