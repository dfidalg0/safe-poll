from django.test import TestCase
from django.core import mail
from rest_framework.test import APIClient
from rest_framework.test import APIRequestFactory
from rest_framework import status
from .models import * 
from rest_framework.test import force_authenticate
from model_bakery import baker
# Create your tests here.

'''
from .views import HelloWorld
class HelloWorldTest(TestCase):
    def test_HelloWorld(self):
        factory = APIRequestFactory()
        client = APIClient()
        request = factory.get('/api/hello/', format='jason')
        response = client.get('/api/hello/')
        response = HelloWorld(request)
        self.assertEqual(response.status_code, 200)
'''


class EmailViewsTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        poll = baker.make('api.Poll')
        group = baker.make('api.Group')
        poll.id = 1
        poll.name = 'Eleicao Teste'
        cls.poll_id = 1
        poll.save()
        group.poll_set.add(poll)
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user{}@abc.de'.format(n)
            user.save()

            #Add the user in the poll:
            poll.group.users.add(user)

            #Now, create the token:
            Token.objects.create_token(poll_id=poll.id, email=user.ref)
        #Create users without token:
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user_without_token{}@abc.de'.format(n)
            user.save()
            #Add the user in the poll:
            poll.group.users.add(user)
        #Create users that has already voted:
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user_that_has_voted{}@abc.de'.format(n)
            user.save()
            #Add the user in the poll:
            poll.group.users.add(user)
            #Add the user in the list emails_voted
            poll.emails_voted.add(user)
        #Create users that are not active.
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'not_active_user{}@abc.de'.format(n)
            user.is_active = False 
            user.save()
            #Add the user in the poll:
            poll.group.users.add(user)
            #Now, create the token:
            Token.objects.create_token(poll_id=poll.id, email=user.ref)



    #'send_group_emails' test
    def test_send_group_emails__http_response(self):
        client = APIClient()
        poll = Poll.objects.get(id=self.poll_id)
        user = poll.admin
        client.force_authenticate(user=user) #Do not check authentication
        response = client.get('/api/send-group-emails/{}/'.format(self.poll_id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 5)
        for i in range(5):
            self.assertEqual(mail.outbox[i].subject, 'Link para a eleicao {}'.format(poll.name))


    #'send_emails' test
    def test_send_individual_email__http_response(self):
        client = APIClient()
        poll = Poll.objects.get(id=self.poll_id)
        user = poll.admin
        client.force_authenticate(user=user) #Do not check authentication
        new_user = baker.make('api.UserAccount')
        new_user.ref = 'new_user@abc.de'
        new_user.save()
        #Add the user in the poll:
        poll.group.users.add(new_user)
        #Now, create the token:
        Token.objects.create_token(poll_id=poll.id, email=new_user.ref)

        response = client.get('/api/send-individual-email/{}/{}'.format(self.poll_id, new_user.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Link para a eleicao {}'.format(poll.name))










