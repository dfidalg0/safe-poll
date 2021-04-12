# REST Framework
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# HTTP
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR
)

# Models
from ..models import (
    Poll, Option, Vote, VALID_POLL_TYPES,
    Group, UserAccount, Token
)

# Django
from django.db import transaction
from django.forms.models import model_to_dict

# Auxiliares
from ..validators import *
from django.core import mail
import datetime

import json
