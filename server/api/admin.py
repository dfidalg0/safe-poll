from django.contrib import admin
from .models import UserAccount, Token
# Register your models here.
admin.site.register(UserAccount),
admin.site.register(Token)
