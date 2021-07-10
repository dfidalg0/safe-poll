from django.test import TestCase
from django.core import mail
from rest_framework.test import APIClient
from rest_framework.test import APIRequestFactory
from rest_framework import status
from ..models import *
from rest_framework.test import force_authenticate
from model_bakery import baker
import json
# Create your tests here.


class EmailViewsTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        poll = baker.make('api.Poll')
        poll.id = 1
        poll.title = 'Eleicao Teste'
        cls.poll_id = 1
        poll.save()
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user{}@abc.de'.format(n)
            user.save()

            #Now, create the token:
            Token.objects.create_token(poll_id=poll.id, email=user.ref)
        #Create users without token:
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user_without_token{}@abc.de'.format(n)
            user.save()
        #Create users that has already voted:
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user_that_has_voted{}@abc.de'.format(n)
            user.save()
            #Add the user in the list emails_voted
            poll.emails_voted.add(user)
        #Create users that are not active.
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'not_active_user{}@abc.de'.format(n)
            user.is_active = False
            user.save()
            #Now, create the token:
            Token.objects.create_token(poll_id=poll.id, email=user.ref)



    #'send_poll_emails' test
    def test_send_poll_emails__http_response(self):
        client = APIClient()
        poll = Poll.objects.get(id=self.poll_id)
        user = poll.admin
        client.force_authenticate(user=user) #Do not check authentication
        response = client.post('/api/emails/send', {'poll_id':poll.id, 'language': 'pt-BR'}, format='json')
        # status 202 because users have already voted
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(len(mail.outbox), 5)
        for i in range(5):
            self.assertEqual(mail.outbox[i].subject, 'Convite para participar da eleição: {}'.format(poll.title))

    #'send_emails' test
    def test_send_list_emails__http_response(self):
        client = APIClient()
        poll = Poll.objects.get(id=self.poll_id)
        user = poll.admin
        client.force_authenticate(user=user) #Do not check authentication
        new_user1 = baker.make('api.UserAccount')
        new_user1.ref = 'new_user1@abc.de'
        new_user1.save()
        new_user2 = baker.make('api.UserAccount')
        new_user2.ref = 'new_user2@abc.de'
        new_user2.save()
        new_user3 = baker.make('api.UserAccount')
        new_user3.ref = 'new_user3@abc.de'
        new_user3.save()
        #Now, create the token:
        Token.objects.create_token(poll_id=poll.id, email=new_user1.ref)
        Token.objects.create_token(poll_id=poll.id, email=new_user2.ref)
        Token.objects.create_token(poll_id=poll.id, email=new_user3.ref)

        response = client.post('/api/emails/send-list', {'poll_id':poll.id, 'users_emails_list':[new_user1.ref, new_user2.ref], 'language': 'pt-BR'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].subject, 'Convite para participar da eleição: {}'.format(poll.title))
        self.assertEqual(mail.outbox[1].subject, 'Convite para participar da eleição: {}'.format(poll.title))

        response = client.post('/api/emails/send-list', {'poll_id':poll.id, 'users_emails_list':[new_user3.ref], 'language': 'pt-BR'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 3)
        self.assertEqual(mail.outbox[2].subject, 'Convite para participar da eleição: {}'.format(poll.title))


class VotesDetailsResultNonSecretPollTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        poll = baker.make('api.Poll')
        poll.id = 1
        poll.title = 'Eleicao Teste'
        poll.secret_vote = False
        poll.type_id = 1
        cls.poll_id = 1
        poll.save()

        option1 = baker.make('api.Option')
        option1.poll = poll
        option1.name = 'A'
        option1.save()

        option2 = baker.make('api.Option')
        option2.poll = poll
        option2.name = 'B'
        option2.save()

        tokens = []
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user{}@abc.de'.format(n)
            user.save()

            #Now, create the token:
            tokens.append(Token.objects.create_token(poll_id=poll.id, email=user.ref).token)

        client = APIClient()
        # half votes in option 'A'
        for n in range(0, 3):
            client.post('/api/votes/compute', {'token': tokens[n], 'option_id': [option1.pk], 'poll_id': 1, 'perm': False}, format='json')
        
        # half votes in option 'B'
        for n in range(3, 5):
            client.post('/api/votes/compute', {'token': tokens[n], 'option_id': [option2.pk], 'poll_id': 1, 'perm': False}, format='json')
        

    #'votes results' test
    def test_non_secret_poll_results_total(self):
        client = APIClient()
        poll = Poll.objects.get(id=self.poll_id)
        user = poll.admin
        client.force_authenticate(user=user) #Do not check authentication
    
        response = client.post('/api/votes/get/' + str(self.poll_id), format='json')
        self.assertEqual(response.data['total'], 5)

    def test_non_secret_poll_results_details(self):
        client = APIClient()
        poll = Poll.objects.get(id=self.poll_id)
        user = poll.admin
        client.force_authenticate(user=user) #Do not check authentication

        votes = []
        for n in range(0, 3):
            votes.append({'id': n+1, 'option': 'A', 'voter': 'user{}@abc.de'.format(n+1)})
        
        for n in range(3, 5):
            votes.append({'id': n+1, 'option': 'B', 'voter': 'user{}@abc.de'.format(n+1)})
        
        response = client.post('/api/votes/get/' + str(self.poll_id), format='json')
        self.assertEqual(response.data['votes'], votes)


class VotesDetailsResultSecretPollTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        poll = baker.make('api.Poll')
        poll.id = 1
        poll.title = 'Eleicao Teste'
        poll.secret_vote = True
        poll.type_id = 1
        cls.poll_id = 1
        poll.save()

        option1 = baker.make('api.Option')
        option1.poll = poll
        option1.name = 'A'
        option1.save()

        option2 = baker.make('api.Option')
        option2.poll = poll
        option2.name = 'B'
        option2.save()

        tokens = []
        for n in range(1, 6):
            user = baker.make('api.UserAccount')
            user.ref = 'user{}@abc.de'.format(n)
            user.save()

            #Now, create the token:
            tokens.append(Token.objects.create_token(poll_id=poll.id, email=user.ref).token)

        client = APIClient()
        # half votes in option 'A'
        for n in range(0, 3):
            client.post('/api/votes/compute', {'token': tokens[n], 'option_id': [option1.pk], 'poll_id': 1}, format='json')
        
        # half votes in option 'B'
        for n in range(3, 5):
            client.post('/api/votes/compute', {'token': tokens[n], 'option_id': [2], 'poll_id': 1}, format='json')
        

    #'votes results' test
    def test_secret_poll_results(self):
        client = APIClient()
        poll = Poll.objects.get(id=self.poll_id)
        user = poll.admin
        client.force_authenticate(user=user) #Do not check authentication
    
        response = client.post('/api/votes/get/' + str(self.poll_id), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Eleição secreta!')


class CreateGroupViewsTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        user = baker.make('api.UserAccount')
        user.ref = 'admin@safepoll.com'
        user.save()
        cls.user = user
        
    def test_create_group(self):
        client = APIClient()
        client.force_authenticate(user=self.user) #Do not check authentication
        response = client.post('/api/groups/create', {'name': 'Group Test', 'emails': ['a@safepoll.com', 'b@safepoll.com']},  format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Grupo criado com sucesso')
    
    def test_create_group_with_same_name(self):
        client = APIClient()
        client.force_authenticate(user=self.user) #Do not check authentication
        client.post('/api/groups/create', {'name': 'Group Test', 'emails': ['a@safepoll.com', 'b@safepoll.com']},  format='json')
        response = client.post('/api/groups/create', {'name': 'Group Test', 'emails': ['c@safepoll.com']},  format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Grupo com este nome já existe!')

    def test_create_group_name_not_string(self):
        client = APIClient()
        client.force_authenticate(user=self.user) #Do not check authentication
        response = client.post('/api/groups/create', {'name': 12345, 'emails': ['a@safepoll.com']},  format='json')        
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(response.data['message'], 'Formulário Inválido')
        self.assertEqual(response.data['fields'], ['name'])

    def test_create_group_emails_empty(self):
        client = APIClient()
        client.force_authenticate(user=self.user) #Do not check authentication
        response = client.post('/api/groups/create', {'name': 'Group Test', 'emails': []},  format='json')        
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(response.data['message'], 'Formulário Inválido')
        self.assertEqual(response.data['fields'], ['emails'])

    def test_create_group_emails_not_in_correct_format(self):
        client = APIClient()
        client.force_authenticate(user=self.user) #Do not check authentication
        response = client.post('/api/groups/create', {'name': 'Group Test', 'emails': ['hello', 'how r u?']},  format='json')  
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(response.data['message'], 'Formulário Inválido')
        self.assertEqual(response.data['fields'], ['emails'])


class DeleteGroupViewsTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        user = baker.make('api.UserAccount')
        user.ref = 'admin@safepoll.com'
        user.save()
        cls.user = user
        group = baker.make('api.Group')
        group.admin = user
        group.pk = 1
        group.name = 'Test Group'
        group.save()

    def test_delete_group(self):
        client = APIClient()
        client.force_authenticate(user = self.user)
        response = client.delete('/api/groups/delete/1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted'], True)
        self.assertEqual(response.data['message'], 'Grupo deletado com sucesso')


    def test_delete_group_do_not_exist(self):
        client = APIClient()
        client.force_authenticate(user = self.user)
        response = client.delete('/api/groups/delete/2')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Grupo não encontrado')


class GetGroupViewsTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        user = baker.make('api.UserAccount')
        user.ref = 'admin@safepoll.com'
        user.save()
        cls.user = user

        group1 = baker.make('api.Group')
        group1.admin = user
        group1.pk = 1
        group1.name = 'Test Group 1'
        group1.save()

        group2 = baker.make('api.Group')
        group2.admin = user
        group2.pk = 2
        group2.name = 'Test Group 2'
        group2.save()
    
    def test_get_group(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response1 = client.get('/api/groups/get/1',  format='json')  
        response2 = client.get('/api/groups/get/2',  format='json')  
        self.assertEqual(response1.data['name'], 'Test Group 1')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data['name'], 'Test Group 2')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

    def test_get_groups(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.get('/api/groups/mine', format='json')
        self.assertEqual(response.data, [{'id': 1, 'name': 'Test Group 1', 'admin': 1}, {'id': 2, 'name': 'Test Group 2', 'admin': 1}])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_group_do_not_exists(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.get('/api/groups/get/3',  format='json')  
        self.assertEqual(response.data['message'], 'Grupo não encontrado')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UpdateGroupViewsTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        user = baker.make('api.UserAccount')
        user.ref = 'admin@safepoll.com'
        user.save()
        cls.user = user

        group1 = baker.make('api.Group')
        group1.admin = user
        group1.pk = 1
        group1.name = 'Test Group 1'
        group1.save()

    def test_update_group(self):
        client = APIClient()
        client.force_authenticate(self.user)
        update_emails = ['a@safepoll.com', 'b@safepoll.com', 'c@safepoll.com']
        response = client.put('/api/groups/update/1', {'emails': update_emails}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], 1)
        self.assertEqual(response.data['message'], 'Grupo atualizado com sucesso')

        response2 = client.get('/api/groups/get/1')
        emails = json.loads(response2.content)['emails']
        self.assertCountEqual(emails, update_emails)

    def test_update_group_do_not_exist(self):
        client = APIClient()
        client.force_authenticate(self.user)
        response = client.put('/api/groups/update/2', {'emails': ['a@safepoll.com']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Grupo não encontrado')

    def test_update_group_empty_emails(self):
        client = APIClient()
        client.force_authenticate(self.user)
        response = client.put('/api/groups/update/1', {'emails': []}, format='json')
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(response.data['message'], 'Formulário Inválido')
        self.assertEqual(response.data['fields'], ['emails'])

    def test_update_group_wrong_format_email(self):
        client = APIClient()
        client.force_authenticate(self.user)
        response = client.put('/api/groups/update/1', {'emails': ['hello', 'tudo bem?']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(response.data['message'], 'Formulário Inválido')
        self.assertEqual(response.data['fields'], ['emails'])
