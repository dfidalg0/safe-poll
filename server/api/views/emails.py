from .context import *
from django.core.mail import EmailMultiAlternatives

import os

BASE_URL = os.environ.get('HEROKU_URL', 'localhost:3000')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'language': lambda v : type(v) == str,
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
            'message':'Eleicao não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    #Check if poll is valid:
    if poll.deadline < datetime.date.today():
        return Response({
            'message':'Eleição finalizada em {}'.format(poll.deadline)
        }, status=HTTP_400_BAD_REQUEST)

    connection = mail.get_connection()
    # Manually open the connection
    connection.open()

    failed_emails = {'failed_to_send':[], 'have_already_voted':[], 'is_not_active':[]}
    failed_emails['have_already_voted'] = list(map(lambda user: user.ref, poll.emails_voted.all()))
    
    try:
        token_list = Token.objects.filter(poll__id= poll.id)
    except Token.DoesNotExist:
        return Response({
            'message': 'Usuarios nao encontrados',
        }, status=HTTP_404_NOT_FOUND)

    emails_voted_list = poll.emails_voted.all()
    
    for token in token_list:
        user = token.user
        if not user.is_active:
            failed_emails['is_not_active'].append(user.id)
            continue
        user_email = user.ref

        user_token = token.token

        emailContent = getEmailMessage(data['language'], poll, user_token)

        msg = EmailMultiAlternatives(emailContent[0], '', 'contato.safepoll@gmail.com', [user_email])
        msg.attach_alternative(emailContent[1], "text/html")

        try:
            msg.send() # Send the email
        except :
            failed_emails['failed_to_send'].append(user.id)

    connection.close()

    if any(map(len, failed_emails.values())) is False: #If both failed_emails.values are 0.
        return Response({
            'message':'Convites para votacao enviados com sucesso.!'
        }, status=HTTP_200_OK)
    else:
        return Response(data={
            'message': 'Falha no envio de emails',
            'failed_emails': failed_emails,
            'faltam_votar': len(token_list) 
        }, status=HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'users_emails_list': lambda v : (
        is_unique_list(v)
    ),
    'language': lambda v : type(v) == str,
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
            'message':'Eleição não é válida, acabou em {}'.format(poll.deadline.strftime("%d/%m/%Y"))
        }, status=HTTP_400_BAD_REQUEST)

    connection = mail.get_connection()
    # Manually open the connection
    connection.open()

    failed_emails = {'no_token':[], 'failed_to_send':[], 'have_already_voted':[], 'is_not_active':[]}
    users_emails_list = data['users_emails_list']

    users_id_list = []
    for email in users_emails_list:
        users_id_list.append(UserAccount.objects.get(ref=email).pk)

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

        emailContent = getEmailMessage(data['language'], poll, user_token)

        msg = EmailMultiAlternatives(emailContent[0], '', 'contato.safepoll@gmail.com', [user_email])
        msg.attach_alternative(emailContent[1], "text/html")

        try:
            msg.send() # Send the email
        except :
            failed_emails['failed_to_send'].append(user.id)

    connection.close()

    if any(map(len, failed_emails.values())) is False: #If both failed_emails.values are 0.
        return Response({
            'message':'Convites para votação enviados com sucesso!'
            }, status=HTTP_200_OK)
    else:
        return Response(data={
            'message': 'Falha no envio de emails',
            'failed_emails': failed_emails
        }, status=HTTP_202_ACCEPTED)


def getEmailMessage(language, poll, user_token):
    if language == 'pt-BR':
        subject = f'Convite para participar da eleição: {poll.title}'
        html_message = (
            f'<p>Olá!</p> <p>Você foi convidado para participar da eleição <strong>{poll.title}</strong>' +
            f', criada por {poll.admin.get_full_name()}. </p> <p> Por favor, clique' +
            f'<a href="{BASE_URL}/polls/{poll.id}/vote?token={user_token}"> aqui </a>' +
            ' para votar.</p>'
            )
        if poll.email_info and len(poll.email_info) > 0:
            html_message += f'<p>Mensagem de {poll.admin.get_full_name()}: <p><strong>"{poll.email_info}"</strong></p>'
        html_message += '<p>Obrigado!</p> <p>Equipe SafePoll</p>'
    elif language == 'es-ES':
        subject = f'Invitación a participar en la elección: {poll.title}'
        html_message = (
            f'<p>Hola!</p> <p>Usted has sido invitado a participar en la elección <strong>{poll.title}</strong>' +
            f', creado por {poll.admin.get_full_name()}. </p> <p> Por favor haz click' +
            f'<a href="{BASE_URL}/polls/{poll.id}/vote?token={user_token}"> aquí </a>' +
            ' para votar.</p>'
            )
        if poll.email_info and len(poll.email_info) > 0:
            html_message += f'<p>Mensaje de {poll.admin.get_full_name()}: <p><strong>"{poll.email_info}"</strong></p>'
        html_message += f'<p>¡Gracias!</p> <p>Equipo SafePoll</p>'
    else:
        subject = f'Invitation to participate in the election: {poll.title}'
        html_message = (
            f'<p>Hello!</p> <p>You have been invited to participate in the election <strong>{poll.title}</strong>' +
            f', created by {poll.admin.get_full_name()}. </p> <p> Please click' +
            f'<a href="{BASE_URL}/polls/{poll.id}/vote?token={user_token}"> here </a>' +
            ' to vote.</p>'
            )
        if poll.email_info and len(poll.email_info) > 0:
            html_message += f'<p>Message from {poll.admin.get_full_name()}: <p><strong>"{poll.email_info}"</strong></p>'
        html_message += '<p>Thank you!</p> <p>SafePoll Team</p>'
    return [subject, html_message]