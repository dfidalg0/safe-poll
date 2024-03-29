from .context import *
import secrets

@api_view(['GET'])
def get_poll(request, pk):
    admin = request.user

    try:
        with transaction.atomic():
            poll = Poll.objects.get(pk=pk)
            options = list(map(model_to_dict, poll.options.all()))
            emails_voted = list(map(lambda user: user.ref, poll.emails_voted.all()))
            poll = model_to_dict(poll)
            poll['options'] = options
            poll['emails_voted'] = emails_voted

            if not admin or admin.pk != poll['admin']:
                del poll['permanent_token']

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(poll)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'title': lambda v: v and type(v) == str,
    'description': lambda v: v and type(v) == str,
    'deadline': is_after_today,
    'options': lambda v: (
        len(v) > 1 and
        is_unique_list(v) and
        all(item and type(item) == str for item in v)
    ),
    'optdesc': lambda v: (
        len(v) > 1 and
        all(type(item) == str for item in v)
    ),
    'secret_vote': lambda v: type(v) == bool,
    'type_id': lambda v: v in VALID_POLL_TYPES,
    'votes_number' : lambda v: v and type(v) == int and v > 0,
    'winners_number' : lambda v: v and type(v) == int and v > 0
})
def create_poll(request: CleanRequest) -> Response:
    data = request.clean_data

    data["admin"] = request.user

    options = data["options"]
    optdesc = data["optdesc"]

    del data["options"]
    del data["optdesc"]

    if len(options) != len(optdesc):
        return Response({
            'message': 'Formulário Inválido',
            'fields': ['options', 'optdesc']
        }, status=HTTP_422_UNPROCESSABLE_ENTITY)

    try:
        with transaction.atomic():
            poll = Poll.objects.create(**data)

            objects = []

            for option, description in zip(options, optdesc):
                objects.append(Option(name=option, description=description, poll=poll))

            Option.objects.bulk_create(objects)
    except Exception as exc:
        print(exc)
        return Response({
            'message': 'Erro Interno do Servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(model_to_dict(poll))


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@with_rules({
    'deadline': is_valid_date_string
})
def update_poll(request: CleanRequest, pk: int) -> Response:
    data = request.clean_data
    admin = request.user

    try:
        poll = Poll.objects.get(pk=pk, admin=admin)
        poll.deadline = data['deadline']
        poll.save()
    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não existe'
        }, status=HTTP_404_NOT_FOUND)
    except:
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'updated': True
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@with_rules({
    'email_info': lambda v: type(v) == str,
})
def update_poll_email_info(request: CleanRequest, pk: int) -> Response:
    data = request.clean_data
    admin = request.user

    try:
        poll = Poll.objects.get(pk=pk, admin=admin)
        poll.email_info = data['email_info']
        poll.save()
    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não existe'
        }, status=HTTP_404_NOT_FOUND)
    except:
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'updated': True
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_poll(request, pk):
    try:
        admin = request.user
        poll = Poll.objects.get(pk=pk, admin=admin)
        poll.delete()
        return Response({
            'message': 'Eleição deletada com sucesso'
        })
    except Poll.DoesNotExist:
        return Response({
            'message': 'Poll não encontrada'
        }, status=HTTP_404_NOT_FOUND)
    except:
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)


# retorna as polls do usuário
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_polls(request):
    user = request.user

    polls = list(map(lambda poll: {
        'id': poll.id,
        'title': poll.title,
        'description': poll.description,
        'deadline': poll.deadline
    },
        Poll.objects
        .only('id', 'title', 'description', 'deadline')
        .filter(admin=user)
    ))

    return Response(polls)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_poll_result(request: Request, pk: int) -> Response:
    try:
        poll = Poll.objects.get(pk=pk)
        if poll.deadline <= datetime.date.today():
            return Response(poll.compute_result())
        else:
            return Response({
                'message': 'A eleicao ainda não finalizou'
            }, status=HTTP_400_BAD_REQUEST)
    except:
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_emails_from_poll(request: CleanRequest, pk: int) -> Response:
    try:
        admin = request.user
        poll = Poll.objects.get(pk=pk, admin=admin)

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    emails = list(map(lambda token: token.user.ref,
    Token.objects
        .only('user')
        .filter(poll=poll)
    ))

    emails_voted = list(map(lambda user: user.ref, poll.emails_voted.all()))
    emails.extend(emails_voted)
    conclusion = {'emails': emails}
    return Response(conclusion)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_permanent_token(request, pk):
    try:
        admin = request.user
        poll = Poll.objects.get(pk=pk, admin=admin)

        return Response({
            'token': poll.permanent_token
        })

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def gen_permanent_token(request, pk):
    token = secrets.token_urlsafe(15)

    try:
        with transaction.atomic():
            admin = request.user
            poll = Poll.objects.get(pk=pk, admin=admin)

            if poll.secret_vote:
                poll.permanent_token = token

                poll.save()

                return Response({
                    'token': token
                })
            else:
                return Response({
                    'message': 'A eleição deve possuir voto secreto'
                }, status=HTTP_401_UNAUTHORIZED)

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_permanent_token(request, pk):
    try:
        with transaction.atomic():
            admin = request.user
            poll = Poll.objects.get(pk=pk, admin=admin)

            poll.permanent_token = None

            poll.save()

            return Response({
                'token': None
            })

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)
