from django.db import models
import secrets
# Create your models here.


class TokenManager(models.Manager):
    #To create a new token, use: "new_token = Token.objects.create_token(email)"
    def create_token(self, user_id, poll_id):
        update_token_value = True
        token_value = self.generate_token()
        while len(self.get_queryset().filter(token=token_value)) != 0: #Loop condition: token_value already exists.
            token_value = self.generate_token()
        new_token = self.create(token=token_value, user_id=user_id, poll_id = poll_id)
        return new_token

    def generate_token(self):
        return str(secrets.token_urlsafe(nbytes=375)) #nbytes==375 is enough to generate 500 chars.

class Token(models.Model):
    #Adicionar FK para polls;

    def __str__(self):
        return self.token
        #return "Poll's ID (FK): {{insert poll's id here}}, e-mail: {0}".format(self.email)

    token   = models.CharField(max_length=500, unique=True)
    poll_id = models.CharField(max_length=100)#models.ForeignKey
    user_id = models.CharField(max_length=100)#models.ForeignKey
    objects = TokenManager()
