from .context import *

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'email_list': lambda v: (
        is_unique_list(v) and
        all(map(is_valid_email, v))
    )
})
def register_emails(request: CleanRequest) -> Response:
    data = request.clean_data

    admin = request.user

    if not Poll.objects.filter(id=data["poll_id"], admin=admin):
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    email_error_list = []
    email_added_list = []

    for email in data["email_list"]:
        try:
            Token.objects.create_token(data["poll_id"], email)
            email_added_list.append(email)
        except:
            email_error_list.append(email)

    conclusion = {'failed_emails': email_error_list, 'added_emails': email_added_list}
    return Response(conclusion)


# cria os tokens a partir do grupo
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'group_id': is_unsigned_int
})
def register_emails_from_group(request: CleanRequest) -> Response:
    data = request.clean_data

    try:
        admin = request.user

        Poll.objects.get(pk=data["poll_id"], admin=admin)

        user_group = Group.objects.get(pk=data["group_id"], admin=admin)

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)
    except Group.DoesNotExist:
        return Response({
            'message': 'Grupo não encontrado'
        }, status=HTTP_404_NOT_FOUND)

    email_error_list = []
    email_added_list = []

    for user in user_group.users.all():
        try:
            Token.objects.create_token(data["poll_id"], user.ref)
            email_added_list.append(user.ref)
        except:
            email_error_list.append(user.ref)

    conclusion = {'failed_emails': email_error_list, 'added_emails': email_added_list}

    return Response(conclusion)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'poll_id': is_unsigned_int,
    'email': is_valid_email,
})
def delete_email_from_poll(request: CleanRequest) -> Response:
    data = request.clean_data
    admin = request.user
    try:
        user = UserAccount.objects.get(ref=data['email'])
        poll = Poll.objects.get(pk=data['poll_id'], admin=admin)
        (count, _) = Token.objects.filter(poll=poll, user=user).delete()

        if not count:
            raise Token.DoesNotExist
    
    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)
    
    except UserAccount.DoesNotExist:
        return Response({
            'message': 'Email não encontrado'
        }, status=HTTP_404_NOT_FOUND)

    except Token.DoesNotExist:
        return Response({
            'message': 'Email não encontrado'
        }, status=HTTP_404_NOT_FOUND)
    except:
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'deleted': True,
        'message': 'Email deletado com sucesso'
    })