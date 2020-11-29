from .context import *

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

                users = map(lambda email : UserAccount(ref=email), emails)

                for i, user in enumerate(users):
                    user.id = max_id + i + 1

                group = Group.objects.create(name=name, admin=admin)
                users = UserAccount.objects.bulk_create(
                    users, ignore_conflicts=True
                )
                group.users.add(*users)
        except Exception as exc:
            print(exc)
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


# retorna os grupos do usuário
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_groups(request):
    user = request.user
    groups = list(map(model_to_dict, Group.objects.filter(admin=user)))

    for group in groups:
        del group['users']

    return Response(groups)
