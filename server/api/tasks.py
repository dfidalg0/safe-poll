from celery import shared_task
from views.context import *


@shared_task
def teste():
    print('Teste')

@shared_task
def send_emails(poll):
    '''
    Description: This function sends emails to the group of emails from the poll 'poll'.
    '''
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

        subject = f'Convite para participar da eleição: {poll.title}'
        html_message = (
            f'<p>Olá!</p> <p>Você foi convidado para participar da eleição <strong>{poll.title}</strong>' +
            f', criada por {poll.admin.get_full_name()}. </p> <p> Por favor, clique' +
            f'<a href="{BASE_URL}/polls/{poll.id}/vote?token={user_token}"> aqui </a>' +
            ' para votar.</p> <p>Obrigado!</p> <p>Equipe SafePoll</p>'
        )

        msg = EmailMultiAlternatives(subject, '', 'contato.safepoll@gmail.com', [user_email])
        msg.attach_alternative(html_message, "text/html")

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

