from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager
)
import secrets


class UserAccountManager(BaseUserManager):

    def base_create_user(self, email, name, password=None):
        if not email:
            raise ValueError('Usuário deve inserir um e-mail')

        email = self.normalize_email(email)
        user = self.model(email=email, name=name)

        user.set_password(password)
        return user

    def create_user(self, email, name, password=None):
        user = self.base_create_user(email, name, password)
        user.save()
        return user

    def create_superuser(self, email, name, password=None):
        user = self.base_create_user(email, name, password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user


class UserAccount(AbstractBaseUser):
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def __str__(self):
        return self.email



class Group (models.Model):
    name = models.CharField(max_length=100)
    admin = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    users = models.ManyToManyField(
        UserAccount,
        blank=True, related_name='groups'
    )


class PollType (models.Model):
    name = models.CharField(max_length=50)


class Poll (models.Model):
    # Informações básicas
    name = models.CharField(max_length=100)
    type = models.ForeignKey(PollType, on_delete=models.CASCADE)
    description = models.TextField(null=True)

    # Último dia para votação
    deadline = models.DateField()

    # Secretude dos votos
    secret_vote = models.BooleanField()

    # Administrador da eleição
    admin = models.ForeignKey(UserAccount, on_delete=models.CASCADE)

    # Número de ganhadores da eleição
    winners_number = models.PositiveIntegerField(default=1)

    # Grupo de usuários associados
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True)

    # Soma máxima dos rankings (para os modelos Instant-runoff e Cumulative)
    rankings_sum = models.PositiveIntegerField(null=True)

    # Relação dos usuários que votaram
    users_voted = models.ManyToManyField(
        UserAccount,
        blank=True, related_name='polls_voted'
    )


class Vote (models.Model):
    poll = models.ForeignKey('Poll', on_delete=models.CASCADE)
    option = models.ForeignKey('Option', on_delete=models.CASCADE)
    user = models.ForeignKey(
        UserAccount,
        null=True, on_delete=models.SET_NULL,
        related_name='votes'
    )
    ranking = models.PositiveIntegerField()

    class Meta:
        indexes = [
            models.Index(fields=['poll', 'user'])
        ]


class Option (models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)


class TokenManager(models.Manager):
    #To create a new token, use: "new_token = Token.objects.create_token(user, poll)"
    def create_token(self, user, poll):
        type_error_status = []
        if not isinstance(user, UserAccount):
            type_error_status.append(('user', 'UserAccount'))
        if not isinstance(poll, Poll):
            type_error_status.append(('poll', 'Poll'))
        if len(type_error_status) != 0:
            msg = ''
            for type_ in type_error_status:
                msg = ''.join([msg, '{} must be {} instance, '.format(*type_)])
            msg = msg[:len(msg) - 2] + '.'
            raise TypeError(msg)

        update_token_value = True
        token_value = self.generate_token()
        if len(self.get_queryset().filter(poll=poll, user=user)) != 0: #Returns None if the 'user' already has a token assigned to the 'poll'.
            return None 
        while len(self.get_queryset().filter(token=token_value)) != 0: #Loop condition: token_value already exists.
            token_value = self.generate_token()
        new_token = self.create(token=token_value, user=user, poll=poll)
        return new_token

    def generate_token(self):
        return str(secrets.token_urlsafe(nbytes=375)) #nbytes==375 is enough to generate 500 chars.

    def get_token(self, user, poll):
        ''' 
        Description: the function 'get_token' returns the token related to the 'poll' and the 'user' passed
        as argument. The token is returned as a string, otherwise, None is returned.
        '''
        type_error_status = []
        if not isinstance(user, UserAccount):
            type_error_status.append(('user', 'UserAccount'))
        if not isinstance(poll, Poll):
            type_error_status.append(('poll', 'Poll'))
        if len(type_error_status) != 0:
            msg = ''
            for type_ in type_error_status:
                msg = ''.join([msg, '{} must be {} instance, '.format(*type_)])
            msg = msg[:len(msg) - 2] + '.'
            raise TypeError(msg)

        token_list = self.get_queryset().filter(poll=poll, user=user)
        result = None
        if len(token_list) == 1:
            token = token_list[0]
            result = token.token
        return result

class Token(models.Model):
    #Adicionar FK para polls;

    def __str__(self):
        return "Token for: UserID = {} , PollID = {}".format(self.user.id, self.poll.id)


    token   = models.CharField(max_length=500, unique=True)
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE) 
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    objects = TokenManager()
