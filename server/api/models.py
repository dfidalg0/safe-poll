from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager
)
import secrets

import datetime

import sys

#Tasks
from celery import shared_task

class UserAccountManager(BaseUserManager):
    def __base_create_user(self, email, name, password=None):
        if not email:
            raise ValueError('Usuário deve inserir um e-mail')

        email = self.normalize_email(email)
        user = self.filter(ref=email, name__isnull=True)
        if user:
            user = user.get()
            user.name = name
            user.email = email
        else:
            user = self.model(email=email, ref=email, name=name)

        if password is not None:
            user.set_password(password)
        return user

    def create_user(self, email, name, password=None):
        user = self.__base_create_user(email, name, password)
        user.save()
        return user

    def create_superuser(self, email, name, password=None):
        user = self.__base_create_user(email, name, password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user


class UserAccount(AbstractBaseUser):
    ref = models.CharField(max_length=128, unique=True)

    email = models.CharField(max_length=128, unique=True, null=True)
    name = models.CharField(max_length=255, null=True)
    password = models.CharField(max_length=128, null=True)
    is_active = models.BooleanField(default=True, null=True)
    is_staff = models.BooleanField(default=False, null=True)
    is_superuser = models.BooleanField(default=False, null=True)

    objects = UserAccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        indexes = [
            models.Index(fields=['email'])
        ]

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def __str__(self):
        return self.ref

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser


class Group (models.Model):
    name = models.CharField(max_length=100)
    admin = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    users = models.ManyToManyField(
        UserAccount,
        blank=True, related_name='groups'
    )


class PollType (models.Model):
    name = models.CharField(max_length=50)


if all(cmd not in sys.argv for cmd in ['makemigrations', 'migrate']):
    VALID_POLL_TYPES = set(map(lambda v : v.id, PollType.objects.all()))
else:
    VALID_POLL_TYPES = set()


#Task que sera utilizada para finalizar a poll.
@shared_task
def kill_poll_tokens(poll_id):
    poll = Poll.objects.get(pk=poll_id)
    token_list = Token.objects.filter(poll_id=poll.id).delete()
    print('Tokens from poll {} were deleted.'.format(poll.id))


@shared_task
def kill_test(poll_id):
    poll = Poll.objects.get(pk=poll_id)
    poll.title = poll.title + '_teste_celery_sucesso'
    poll.save()
    print('Test deleted!')


class PollManager(models.Manager):
    def create(self, *args, **kwargs):
        poll = super().create(*args, **kwargs)

        #Agendar o termino da poll:
        if type(poll.deadline) == str:
            (year, month, day) = (int(i) for i in poll.deadline.split('-'))
            poll.deadline = datetime.date(year, month, day)

        days_remaining = (poll.deadline - datetime.date.today()).days
        current_time = datetime.datetime.now().time()
        hour = current_time.hour
        minute = current_time.minute
        second = current_time.second
        ONE_DAY = 24*3600
        remaining_seconds = ONE_DAY - (hour*3600 + minute*60 + second)
        delay = days_remaining*ONE_DAY + remaining_seconds

        # Linha comentada por razões de "não consigo fazer isso funcionar"

        # kill_poll_tokens.apply_async((poll.id,), countdown=delay)
        return poll

class Poll (models.Model):
    # Informações básicas
    title = models.CharField(max_length=100)
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

    # Soma máxima dos rankings (para os modelos Instant-runoff e Cumulative)
    rankings_sum = models.PositiveIntegerField(null=True)

    # Relação dos emails que votaram
    emails_voted = models.ManyToManyField(
        UserAccount,
        blank=True, related_name='polls_voted'
    )

    #Define the new manager:
    objects = PollManager()


    #Computar os resultados da eleicao:
    def compute_result(self):
        if self.type.id == 1 or self.type.id == 2:
            return self._compute_result_unranked_voting()

    def _compute_result_unranked_voting(self):
        options = Option.objects.filter(poll_id=self.id)
        votes   = Vote.objects.filter(poll_id=self.id)
        counting_votes = {}
        for option in options:
            counting_votes[option.id] = 0
        for vote in votes:
            counting_votes[vote.option.id] += 1
        if counting_votes:
            max_votes = max(counting_votes.values())
            winners = [v for v in counting_votes if counting_votes[v] == max_votes]
        else:
            winners = []

        final_result = {
            'winners':winners,
            'counting_votes':counting_votes
        }
        return final_result


class Vote (models.Model):
    poll = models.ForeignKey('Poll', on_delete=models.CASCADE)
    option = models.ForeignKey('Option', on_delete=models.CASCADE)
    voter = models.ForeignKey(
        UserAccount,
        null=True, on_delete=models.SET_NULL,
        related_name='votes'
    )
    ranking = models.PositiveIntegerField()

    class Meta:
        indexes = [
            models.Index(fields=['poll', 'voter'])
        ]


class Option (models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')

# Token.
class TokenManager(models.Manager):
    # To create a new token, use: "Token.objects.create_token(poll_id, email)"
    def create_token(self, poll_id: int, email: str):
        type_error_status = []
        if not isinstance(email, str):
            type_error_status.append(('email', 'str'))
        if not isinstance(poll_id, int):
            type_error_status.append(('poll_id', 'int'))
        if len(type_error_status) != 0:
            msg = ''
            for type_ in type_error_status:
                msg = ''.join([msg, '{} must be {} instance, '.format(*type_)])
            msg = msg[:len(msg) - 2] + '.'
            raise TypeError(msg)

        update_token_value = True
        result_list = self.get_queryset().filter(poll__id=poll_id, user__ref=email)
        if len(result_list ) != 0:
            return result_list[0]
        token_value = self._generate_token()
        while len(self.get_queryset().filter(token=token_value)) != 0: #Loop condition: token_value already exists.
            token_value = self._generate_token()

        (user, _) = UserAccount.objects.get_or_create(ref=email)
        poll     = Poll.objects.get(id=poll_id)

        new_token = self.create(
            token=token_value,
            poll=poll,
            user=user
        )
        return new_token

    def _generate_token(self):
        # nbytes == 375 is enough to generate 500 chars.
        return str(secrets.token_urlsafe(nbytes=375))

    def get_token(self, email, poll_id):
        '''
        Description: the function 'get_token' returns the token related to the 'poll_id' and the user 'email' passed
        as argument. The token is returned as a string, otherwise, None is returned.
        '''
        type_error_status = []
        if not isinstance(email, str):
            type_error_status.append(('email', 'str'))
        if not isinstance(poll_id, int):
            type_error_status.append(('poll_id', 'int'))
        if len(type_error_status) != 0:
            msg = ''
            for type_ in type_error_status:
                msg = ''.join([msg, '{} must be {} instance, '.format(*type_)])
            msg = msg[:len(msg) - 2] + '.'
            raise TypeError(msg)

        token_list = self.get_queryset().filter(poll__id=poll_id, user__ref=email)
        result = None
        if len(token_list) == 1:
            token = token_list[0]
            result = token.token
        return result


class Token(models.Model):
    def __str__(self):
        return "Token for: UserID = {} , PollID = {}".format(self.user.id, self.poll.id)

    token = models.CharField(max_length=500, unique=True)
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    objects = TokenManager()
