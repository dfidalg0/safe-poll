from django.http import JsonResponse
from random import randint
from django.core import mail

# Create your views here.
from django.core.mail import BadHeaderError, send_mail
from django.http import HttpResponse, HttpResponseRedirect


def HelloWorld(req):
    return JsonResponse({
        'message': f'Hello, {randint(0, 100)}!'
    })


#Email views:
def send_emails(request, user_list, poll):
    '''
    Description: ...
    '''
    #Check if poll is valid:

    #Send emails:
    connection = mail.get_connection()

    # Manually open the connection
    connection.open()

    user_group = poll.group.users
    for user in user_list:
        if not user.is_active or user not in user_group:
            continue
        user_email = user.email
        user_token = Token.objects.get(poll=poll, user=user)
        # Construct an email message that uses the connection
        email = mail.EmailMessage(
            'Link para a eleicao {}'.format(poll.name),
            'Link: www.abc.db/{}'.format(user_token),
            'from@example.com',
            [user_email],
            connection=connection
            )
        email.send() # Send the email
    connection.close()


def send_group_emails(request, poll):
    '''    
    Description: ...
    '''

    #Check if poll is valid:

    #Send emails:
    connection = mail.get_connection()

    # Manually open the connection
    connection.open()

    user_group = poll.group.users
    for user in user_group:
        if not user.is_active:
            continue
        user_email = user.email
        user_token = Token.objects.get(poll=poll, user=user)
        # Construct an email message that uses the connection
        email = mail.EmailMessage(
            'Link para a eleicao {}'.format(poll.name),
            'Link: www.abc.db/{}'.format(user_token),
            'from@example.com',
            [user_email],
            connection=connection
            )
        email.send() # Send the email
    connection.close()
