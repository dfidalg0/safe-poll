from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from random import randint
from .models import Poll, Option , Token , Group , UserAccount , Vote


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

    if not Poll.objects.filter(id = data["poll_id"]):
        return Response(data='Poll not found')

    email_error_list = []

    for email in data["email_list"]:
        try:
            Token.objects.create_token(data["poll_id"], email)
        except:
            email_error_list.append(email)

    del data["email_list"]

    conclusion = {'not_created_tokens_list': email_error_list}
    return Response(conclusion)


# cria os tokens a partir do grupo e coloca o grupo como atributo da eleição ( Poll.group )
@api_view(['POST'])
def register_emails_from_group(request):

    data = request.data

    try:
        poll = Poll.objects.get( pk = data["poll_id"] )
    except Poll.DoesNotExist:
        return Response(data='Poll not found')

    try:
        user_group = Group.objects.get( pk = data["group_id"] )
    except Group.DoesNotExist:
        return Response(data='Group not found')

    poll.group = user_group
    poll.save()

    email_error_list = []

    for user in user_group.users.all():
        if not user.email:
            try:
                Token.objects.create_token(data["poll_id"], user.ref)
            except:
                email_error_list.append(user.ref)
        else:
            try:
                Token.objects.create_token(data["poll_id"], user.email)
            except:
                email_error_list.append(user.email)

    conclusion = {'not_created_tokens_list': email_error_list}

    return Response(conclusion)


@api_view(['POST'])
def compute_vote(request):

    data = request.data

    try:
        token = Token.objects.get(pk=data["token_id"])
    except Token.DoesNotExist:
        return Response(data='Token does not exist')

    poll = token.poll

    try:
        option = Option.objects.get(pk=data["option_id"])
    except Option.DoesNotExist:
        return Response(data='Poll option does not exist')

    if option.poll.id != poll.id :
        return Response(data='Error : Selected option is from another poll')

    user = token.user

    poll.emails_voted.add(user)
    poll.save()

    vote = Vote()
    vote.poll = poll
    vote.option = option
    vote.voter = user

    # first past the post
    if poll.type.id == 1:
        vote.ranking = 1

    vote.save()

    token.delete()

    conclusion = {'vote_id': vote.id}
    return Response(conclusion)
