from django.http import (JsonResponse, HttpResponse)
from random import randint
from django.core import mail
import datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import (Poll, Token, UserAccount)
# Create your views here.

def HelloWorld(request):
    return JsonResponse({
        'message': f'Hello, {randint(0, 100)}!'
    })


#Email views:

@api_view(['GET'])
def send_individual_email(request, poll_id, user_id):
    '''    
    Description: Envia emails para o grupo de usuarios/emails cadastrados em uma dada eleicao com id == poll_id.
    '''
    #Get the desired poll.
    try:
        poll = Poll.objects.get(pk=poll_id)
    except Poll.DoesNotExist:
        return Response(data='Desired poll does not exist', status=status.HTTP_404_NOT_FOUND)

    #Check if poll is valid:
    if poll.deadline > datetime.date.today():
        return Response(data='Eleicao nao eh valida')

    connection = mail.get_connection()
    # Manually open the connection
    connection.open()

    failed_emails = {'no_token':[], 'failed_to_send':[], 'have_already_voted':[], 'is_not_active':[]}
    user_group = poll.group.users.all()
    try:
        user = poll.group.users.get(id=user_id)
    except UserAccount.DoesNotExist:
        return Response(data='User is not in this poll', status=status.HTTP_404_NOT_FOUND)
    if not user.is_active:
        failed_emails['is_not_active'].append(user.id)
        connection.close()
        return Response(data=failed_emails)
    user_email = user.ref
    
    #Check if the user has already voted.
    if user in poll.emails_voted.all():
        failed_emails['have_already_voted'].append(user.id)
        connection.close()
        return Response(data=failed_emails)

    #Try to get the user's Token to vote.
    try:
        user_token = Token.objects.get(poll=poll, user=user).token
    except Token.DoesNotExist:
        failed_emails['no_token'].append(user.id)
        connection.close()
        return Response(data=failed_emails)

    # Construct an email message that uses the connection
    email = mail.EmailMessage(
        'Link para a eleicao {}'.format(poll.name),
        'Link: www.abc.db/{}'.format(user_token),
        'contato.safepoll@gmail.com',
        [user_email],
        connection=connection
        )
    try:
        email.send() # Send the email
        connection.close()
        return Response(status=status.HTTP_200_OK)
    except :
        failed_emails['failed_to_send'].append(user.id)
        connection.close()
        return Response(data=failed_emails)

@api_view(['GET'])
def send_group_emails(request, poll_id):
    '''    
    Description: Envia emails para o grupo de usuarios/emails cadastrados em uma dada eleicao com id == poll_id.
    '''
    #Get the desired poll.
    try:
        poll = Poll.objects.get(pk=poll_id)
    except Poll.DoesNotExist:
        return Response(data='Desired poll does not exist', status=status.HTTP_404_NOT_FOUND)

    #Check if poll is valid:
    if poll.deadline > datetime.date.today():
        return Response(data='Eleicao nao eh valida')

    connection = mail.get_connection()
    # Manually open the connection
    connection.open()

    failed_emails = {'no_token':[], 'failed_to_send':[], 'have_already_voted':[], 'is_not_active':[]}
    user_group = poll.group.users.all()
    for user in user_group:
        if not user.is_active:
            failed_emails['is_not_active'].append(user.id)
            continue
        user_email = user.ref
        
        #Check if the user has already voted.
        if user in poll.emails_voted.all():
            failed_emails['have_already_voted'].append(user.id)
            continue

        #Try to get the user's Token to vote.
        try:
            user_token = Token.objects.get(poll=poll, user=user).token
        except Token.DoesNotExist:
            failed_emails['no_token'].append(user.id)
            continue

        # Construct an email message that uses the connection
        email = mail.EmailMessage(
            'Link para a eleicao {}'.format(poll.name),
            'Link: www.abc.db/{}'.format(user_token),
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
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(data=failed_emails)
