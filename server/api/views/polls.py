from .context import *


@api_view(['GET'])
def get_poll(request, pk):
    try:
        with transaction.atomic():
            poll = Poll.objects.get(pk=pk)
            options = list(map(model_to_dict, poll.options.all()))
            emails_voted = list(map(lambda user: user.ref, poll.emails_voted.all()))
            poll = model_to_dict(poll)
            poll['options'] = options
            poll['emails_voted'] = emails_voted

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)
    except:
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
    'secret_vote': lambda v: type(v) == bool,
    'type_id': lambda v: v in VALID_POLL_TYPES
})
def create_poll(request: CleanRequest) -> Response:
    data = request.clean_data

    data["admin"] = request.user

    options = data["options"]
    del data["options"]

    try:
        with transaction.atomic():
            poll = Poll.objects.create(**data)
            objects = []

            for option in options:
                objects.append(Option(name=option, description='', poll=poll))

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
    'deadline': is_after_today
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
def get_poll_result(request: CleanRequest, pk: int) -> Response:
    data = request.clean_data
    poll = Poll.objects.get(pk=pk)
    if poll.deadline < datetime.date.today():
        return Response(poll.compute_result())
    else:
        return Response({
            'message': 'A eleicao ainda nao finalizou'
        }, status=HTTP_400_BAD_REQUEST)


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
