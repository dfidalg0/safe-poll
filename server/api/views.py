# REST Framework
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# HTTP
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR
)

# Models
from .models import (
    Poll, Option, Vote, VALID_POLL_TYPES,
    Group, UserAccount, Token
)

# Django
from django.db import transaction
from django.core import serializers

# Auxiliares
from .validators import *

import json

# Create your views here.

# view em que o usuário precisa estar logado


class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request: Request) -> Response:
        user = request.user
        content = {'message': f'Hello, {user.get_full_name()}!'}
        return Response(content)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'name': lambda v: v and type(v) == str,
    'description': lambda v: v and type(v) == str,
    'deadline': is_after_today,
    'options': lambda v: (
        len(v) > 1 and
        is_unique_list(v) and
        all(item and type(item) == str for item in v)
    ),
    'secret_vote': lambda v: type(v) == bool,
    'type_id': lambda v: v in VALID_POLL_TYPES
})
def create_poll(request: CleanRequest) -> Response:
    data = request.clean_data

    data["admin"] = request.user

    options = data["options"]
    del data["options"]

    try:
        with transaction.atomic():
            poll = Poll.objects.create(**data)
            objects = []

            for option in options:
                objects.append(Option(name=option, description='', poll=poll))

            Option.objects.bulk_create(objects)
    except:
        return Response({
            'message': 'Erro Interno do Servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    res = serializers.serialize(
        'json', [Poll.objects.filter(id=poll.id).first()])
    res = json.loads(res)
    conclusion = {'poll': res}
    return Response(conclusion)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'email_list': lambda v: (
        is_unique_list(v) and
        all(map(is_valid_email, v))
    )
})
def register_emails(request: CleanRequest) -> Response:
    data = request.clean_data

    admin = request.user

    if not Poll.objects.filter(id=data["poll_id"], admin=admin):
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    email_error_list = []

    for email in data["email_list"]:
        try:
            Token.objects.create_token(data["poll_id"], email)
        except:
            email_error_list.append(email)

    conclusion = {'failed_emails': email_error_list}
    return Response(conclusion)


# cria os tokens a partir do grupo e coloca o grupo como atributo da eleição ( Poll.group )
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'group_id': is_unsigned_int
})
def register_emails_from_group(request: CleanRequest) -> Response:
    data = request.clean_data

    try:
        admin = request.user

        poll = Poll.objects.get(pk=data["poll_id"], admin=admin)

        user_group = Group.objects.get(pk=data["group_id"], admin=admin)

        poll.group = user_group
        poll.save()
    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)
    except Group.DoesNotExist:
        return Response({
            'message': 'Grupo não encontrado'
        }, status=HTTP_404_NOT_FOUND)

    email_error_list = []

    for user in user_group.users.all():
        try:
            Token.objects.create_token(data["poll_id"], user.ref)
        except:
            email_error_list.append(user.ref)

    conclusion = {'failed_emails': email_error_list}

    return Response(conclusion)


@api_view(['POST'])
@with_rules({
    'token': lambda v: type(v) == str,
    'option_id': is_unsigned_int,
    'poll_id': is_unsigned_int
})
def compute_vote(request: CleanRequest) -> Response:
    data = request.clean_data

    try:
        token = Token.objects.get(token=data['token'], poll_id=data['poll_id'])

        option = Option.objects.get(
            pk=data['option_id'], poll_id=data['poll_id'])

    except Option.DoesNotExist:
        return Response({
            'message': 'Opção não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    except Token.DoesNotExist:
        return Response({
            'message': 'Credenciais inválidas'
        }, status=HTTP_401_UNAUTHORIZED)

    poll = token.poll
    user = token.user

    try:
        with transaction.atomic():
            poll.emails_voted.add(user)

            vote = Vote(poll=poll, option=option)

            if not poll.secret_vote:
                vote.voter = user

            if poll.type_id == 1:
                vote.ranking = 1

            poll.save()
            vote.save()
            token.delete()
    except:
        return Response({
            'message': 'Erro Interno do Servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    conclusion = {'vote_id': vote.id}
    return Response(conclusion)


# retorna as polls do usuário
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_polls(request):
    user = request.user
    polls = serializers.serialize('json', Poll.objects.filter(admin=user))
    polls = json.loads(polls)

    content = {'polls': polls}
    return Response(content)


# retorna as opções para uma poll específica
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def poll_options(request, pk):
    user = request.user
    poll = Poll.objects.filter(admin=user, pk=pk)[0]
    if poll:
        options = serializers.serialize(
            'json', Option.objects.filter(poll=poll))
        options = json.loads(options)
    else:
        options = []
    return Response({'options': options})
