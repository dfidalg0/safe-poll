from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from random import randint
from .models import Poll, Option , Token , Group , UserAccount


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

    data["admin_id"] = request.user.id

    options = data["options"]
    del data["options"]

    poll = Poll.objects.create(**data)
    objects = []

    for option in options:
        objects.append(Option(name=option, description='', poll=poll))

    Option.objects.bulk_create(objects)

    conclusion = {'id': poll.id}
    return Response(conclusion)

@api_view(['POST'])
def register_emails(request):

    data = request.data

    email_error_list = []

    for email in data["email_list"]:
        try:
            Token.objects.create_token(data["poll_id"], email)
        except:
            email_error_list.append(email)

    del data["email_list"]

    conclusion = {'error_list': email_error_list}
    return Response(conclusion)


# cria os tokens a partir do grupo e coloca o grupo como atributo da eleição ( Poll.group )
@api_view(['POST'])
def register_emails_from_group(request):

    data = request.data

    try:
        poll = Poll.objects.get( pk = data["poll_id"] )
    except Poll.DoesNotExist:
        return Response(data='Desired poll does not exist', status=status.HTTP_404_NOT_FOUND)

    try:
        user_group = Group.objects.get( pk = data["group_id"] )
    except Group.DoesNotExist:
        return Response(data='Desired group does not exist', status=status.HTTP_404_NOT_FOUND)

    poll.group = user_group
    poll.save()

    email_error_list = []

    for user in user_group.users.all():
        try:
            Token.objects.create_token(data["poll_id"], user.email)
        except:
            email_error_list.append(user.email)

    conclusion = {'error_list': email_error_list}

    return Response(conclusion)
