# REST Framework
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# HTTP
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
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


# Auxiliares
from .validators import *
from django.core import mail
import datetime

# Create your views here.

#Email views:

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'users_id_list': lambda v : (
        is_unique_list(v) and
        all(map(is_unsigned_int, v))
    )
})
def send_list_emails(request: CleanRequest) -> Response:
    '''
    Description: Envia emails para uma lista especifica de usuarios. Sao enviados emails somente para os usuarios cadastrados na eleicao.
    '''
    data = request.clean_data
    admin = request.user
    #Get the desired poll.
    try:
        poll = Poll.objects.get(pk=data['poll_id'] , admin=admin)
    except Poll.DoesNotExist:
        return Response({
            'message':'Eleicao nao existe.'
            }, status=HTTP_404_NOT_FOUND)

    #Check if poll is valid:
    if poll.deadline < datetime.date.today():
        return Response({
            'message':'Eleicao nao eh valida acabou em {}'.format(poll.deadline)
            })

    connection = mail.get_connection()
    # Manually open the connection
    connection.open()

    failed_emails = {'no_token':[], 'failed_to_send':[], 'have_already_voted':[], 'is_not_active':[]}
    users_id_list = data['users_id_list']
    token_list = []
    for user_id in users_id_list:
        try:
            token = Token.objects.get(poll__id= poll.id, user__id=user_id)
            token_list.append(token)
        except Token.DoesNotExist:
            failed_emails['no_token'].append(user_id)

    emails_voted_list = poll.emails_voted.all()
    for token in token_list:
        user = token.user
        if not user.is_active:
            failed_emails['is_not_active'].append(user.id)
            continue
        user_email = user.ref

        #Check if the user has already voted.
        if user in emails_voted_list:
            failed_emails['have_already_voted'].append(user.id)
            continue
        user_token = token.token
        # Construct an email message that uses the connection
        email = mail.EmailMessage(
            'Link para a eleicao {}'.format(poll.name),
            'Link: www.safe-polls.com/{}'.format(user_token),
            'contato.safepoll@gmail.com',
            [user_email],
            connection=connection
            )
        try:
            email.send() # Send the email
        except :
            failed_emails['failed_to_send'].append(user.id)
    connection.close()
    if any(list(map(len, failed_emails.values()))) is False: #If both failed_emails.values are 0.
        return Response({
            'message':'Convites para votacao enviados com sucesso.!'
            }, status=HTTP_200_OK)
    else:
        return Response(data=failed_emails, status=HTTP_200_OK)
    




@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int
})
def send_poll_emails(request: CleanRequest) -> Response:
    '''
    Description: Envia emails para o conjunto de usuarios/emails cadastrados em uma dada eleicao com id == poll_id.
    '''
    data = request.clean_data
    admin = request.user
    #Get the desired poll.
    try:
        poll = Poll.objects.get(pk=data['poll_id'] , admin=admin)
    except Poll.DoesNotExist:
        return Response({
            'message':'Eleicao nao existe.'
            }, status=HTTP_404_NOT_FOUND)

    #Check if poll is valid:
    if poll.deadline < datetime.date.today():
        return Response({
            'message':'Eleicao nao eh valida acabou em {}'.format(poll.deadline)
            })

    connection = mail.get_connection()
    # Manually open the connection
    connection.open()

    failed_emails = {'failed_to_send':[], 'have_already_voted':[], 'is_not_active':[]}
    try:
        token_list = Token.objects.filter(poll__id= poll.id)
    except Token.DoesNotExist:
        return Response({
            'message': 'Usuarios nao encontrados'
            }, status=HTTP_404_NOT_FOUND)
    emails_voted_list = poll.emails_voted.all()
    for token in token_list:
        user = token.user
        if not user.is_active:
            failed_emails['is_not_active'].append(user.id)
            continue
        user_email = user.ref

        #Check if the user has already voted.
        if user in emails_voted_list:
            failed_emails['have_already_voted'].append(user.id)
            continue
        user_token = token.token
        # Construct an email message that uses the connection
        email = mail.EmailMessage(
            'Link para a eleicao {}'.format(poll.name),
            'Link: www.safe-polls.com/{}'.format(user_token),
            'contato.safepoll@gmail.com',
            [user_email],
            connection=connection
            )
        try:
            email.send() # Send the email
        except :
            failed_emails['failed_to_send'].append(user.id)
    connection.close()
    if any(list(map(len, failed_emails.values()))) is False: #If both failed_emails.values are 0.
        return Response({
            'message':'Convites para votacao enviados com sucesso.!'
            }, status=HTTP_200_OK)
    else:
        return Response(data=failed_emails, status=HTTP_200_OK)


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
    'name': lambda v : v and type(v) == str,
    'description': lambda v : v and type(v) == str,
    'deadline': is_after_today,
    'options': lambda v : (
        len(v) > 1 and
        is_unique_list(v) and
        all(item and type(item) == str for item in v)
    ),
    'secret_vote': lambda v : type(v) == bool,
    'type_id': lambda v : v in VALID_POLL_TYPES
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

    conclusion = {'id': poll.id}
    return Response(conclusion)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'email_list': lambda v : (
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

    conclusion = { 'failed_emails': email_error_list }

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

        option = Option.objects.get(pk=data['option_id'], poll_id=data['poll_id'])

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

    conclusion = { 'vote_id': vote.id }
    return Response(conclusion)


@api_view(['GET'])
@with_rules({
    'poll_id': is_unsigned_int
})
def return_result(request: CleanRequest) -> Response:
    data = request.clean_data
    poll = Poll.objects.get(pk=data['poll_id'])
    if poll.deadline < datetime.date.today():
        return Response(poll.compute_result())
    else:
        return Response({
            'message':'A eleicao ainda nao finalizou'
            })


