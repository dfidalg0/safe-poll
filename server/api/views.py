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


def send_emails(request, user_list, poll):
    '''
    Description: ...
    '''

    subject = request.POST.get('subject', '')
    message = request.POST.get('message', '')
    from_email = request.POST.get('from_email', '')
    if subject and message and from_email:
        try:
            send_mail(subject, message, from_email, ['admin@example.com'])
        except BadHeaderError:
            return HttpResponse('Invalid header found.')
        return HttpResponseRedirect('/contact/thanks/')
    else:
        # In reality we'd use a form class
        # to get proper validation errors.
        return HttpResponse('Make sure all fields are entered and valid.')


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
