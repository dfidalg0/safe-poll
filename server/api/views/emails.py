from .context import *

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

        #Check if the user has already voted.
        if user in emails_voted_list:
            failed_emails['have_already_voted'].append(user.id)
            continue
        user_token = token.token
        # Construct an email message that uses the connection
        email = mail.EmailMessage(
            'Link para a eleicao {}'.format(poll.title),
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

    if any(map(len, failed_emails.values())) is False: #If both failed_emails.values are 0.
        return Response({
            'message':'Convites para votacao enviados com sucesso.!'
        }, status=HTTP_200_OK)
    else:
        return Response(data={
            'message': 'Falha no envio de emails',
            'failed_emails': failed_emails
        }, status=HTTP_202_ACCEPTED)


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
            'Link para a eleicao {}'.format(poll.title),
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

    if any(map(len, failed_emails.values())) is False: #If both failed_emails.values are 0.
        return Response({
            'message':'Convites para votacao enviados com sucesso.!'
            }, status=HTTP_200_OK)
    else:
        return Response(data={
            'message': 'Falha no envio de emails',
            'failed_emails': failed_emails
        }, status=HTTP_202_ACCEPTED)