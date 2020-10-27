from django.http import JsonResponse
from random import randint

# Create your views here.


def HelloWorld(req):
    return JsonResponse({
        'message': f'Hello, {randint(0, 100)}!'
    })
