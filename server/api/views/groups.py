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
        group = Group.objects.create(name=name, admin=admin)

        for email in emails:
            (user, _) = UserAccount.objects.get_or_create(ref=email)
            user.save()
            group.users.add(user)

        group = serializers.serialize('json', [group])
        group = json.loads(group)
        return Response({
           'group': group,
            'message': 'Grupo criado com sucesso!'
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
    groups = serializers.serialize('json', Group.objects.filter(admin=user))
    groups = json.loads(groups)

    content = {'groups': groups}
    return Response(content)
