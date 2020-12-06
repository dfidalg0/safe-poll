from .context import *

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group(request: Request, pk: int) -> Response:
    user = request.user

    try:
        with transaction.atomic():
            group = Group.objects.get(pk=pk)
            name = group.name
            emails = map(lambda u : u.ref, group.users.all())
    except Group.DoesNotExist:
        return Response({
            'message': 'Grupo não encontrado'
        }, status=HTTP_404_NOT_FOUND)
    except:
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'name': name,
        'emails': emails
    })

# criação de novo grupo de usuários
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@with_rules({
    'name': lambda v : type(v) == str,
    'emails': lambda v : (
        is_unique_list(v) and
        all(map(is_valid_email, v))
    )
})
def create_group(request: CleanRequest) -> Response:
    data = request.clean_data

    name = data['name']
    emails = data['emails']

    admin = request.user

    if not Group.objects.filter(name=name, admin=admin):
        try:
            with transaction.atomic():
                max_id = int(Group.objects.latest('pk').pk)

                users = list(map(lambda email : UserAccount(ref=email), emails))

                for i, user in enumerate(users):
                    user.id = max_id + i + 1

                group = Group.objects.create(name=name, admin=admin)
                UserAccount.objects.bulk_create(
                    users, ignore_conflicts=True
                )

                users = UserAccount.objects.filter(ref__in=emails)

                group.users.add(*users)
        except:
            return Response({
                'message': 'Erro Interno do Servidor'
            }, status=HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'id': group.id,
            'message': 'Grupo criado com sucesso'
        })
    else:
        return Response({
            'message': 'Grupo com este nome já existe!'
        }, status=HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@with_rules({
    'emails': lambda v : (
        is_unique_list(v) and
        all(map(is_valid_email, v))
    )
})
def update_group(request: CleanRequest, pk: int) -> Response:
    emails = set(request.clean_data['emails'])

    admin = request.user

    try:
        with transaction.atomic():
            group = Group.objects.get(pk=pk, admin=admin)

            max_id = int(Group.objects.latest('pk').pk)

            prev_users = group.users.all()
            prev_emails = set(map(lambda u : u.ref, prev_users))

            create = list(map(lambda email : UserAccount(ref=email), emails - prev_emails))
            delete = prev_users.filter(ref__in=prev_emails - emails)

            for i, user in enumerate(create):
                user.id = max_id + i + 1

            if create:
                UserAccount.objects.bulk_create(
                    create, ignore_conflicts=True
                )

                users = UserAccount.objects.filter(ref__in=create)

                group.users.add(*users)

            if delete:
                group.users.remove(*delete)

    except Group.DoesNotExist:
        return Response({
            'message': 'Grupo não encontrado'
        }, status=HTTP_404_NOT_FOUND)
    except Exception as exc:
        print(exc)
        return Response({
            'message': 'Erro Interno do Servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'id': group.id,
        'message': 'Grupo atualizado com sucesso'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_group(request: Request, pk: int):
    admin = request.user

    try:
        (count, _) = Group.objects.filter(pk=pk, admin=admin).delete()

        if not count:
            raise Group.DoesNotExist

    except Group.DoesNotExist:
        return Response({
            'message': 'Grupo não encontrado'
        }, status=404)
    except:
        return Response({
            'message': 'Erro interno do servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'deleted': True,
        'message': 'Grupo deletado com sucesso'
    })

# retorna os grupos do usuário
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_groups(request):
    user = request.user
    groups = list(map(model_to_dict, Group.objects.filter(admin=user)))

    for group in groups:
        del group['users']

    return Response(groups)
