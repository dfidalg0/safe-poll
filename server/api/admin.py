from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Token)
admin.site.register(Poll)
admin.site.register(Option)
admin.site.register(PollType)
admin.site.register(Group)
admin.site.register(UserAccount)