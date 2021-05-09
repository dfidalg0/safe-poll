from .context import *

@api_view(['POST'])
@with_rules({
    'token': lambda v: type(v) == str,
    'option_id': is_unsigned_int,
    'poll_id': is_unsigned_int
})
def compute_vote(request: CleanRequest) -> Response:
    data = request.clean_data

    try:
        token = Token.objects.get(token=data['token'], poll_id=data['poll_id'])

        option = Option.objects.get(
            pk=data['option_id'], poll_id=data['poll_id'])

    except Option.DoesNotExist:
        return Response({
            'message': 'Opção não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    except Token.DoesNotExist:
        return Response({
            'message': 'Credenciais inválidas'
        }, status=HTTP_401_UNAUTHORIZED)

    poll = token.poll
    user = token.user

    try:
        with transaction.atomic():
            poll.emails_voted.add(user)

            vote = Vote(poll=poll, option=option)

            if not poll.secret_vote:
                vote.voter = user

            if poll.type_id == 1:
                vote.ranking = 1

            poll.save()
            vote.save()
            token.delete()
    except:
        return Response({
            'message': 'Erro Interno do Servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    conclusion = {'vote_id': vote.id}
    return Response(conclusion)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@with_rules({
    'page': is_unsigned_int,
    'per_page': is_unsigned_int,
    'option_filter': lambda v: type(v) == str or v == None,
    'email_filter': lambda v: type(v) == str or v == None,
    'order_by': lambda v: type(v) == str or v == None
})
def get_poll_votes(request: CleanRequest, pk: int) -> Response:
    try:
        admin = request.user
        poll = Poll.objects.get(pk=pk, admin=admin)

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)
    
    votes_all = Vote.objects.filter(poll=poll)

    data = request.clean_data
    page = data['page']
    per_page = data['per_page']

    if 'email_filter' in data:
        users_filter = UserAccount.objects.filter(ref__startswith = data['email_filter'])
        votes_all = votes_all.filter(voter__in = users_filter)


    if 'option_filter' in data:
        votes_all = votes_all.filter(option__name__startswith = data['option_filter'])
    
    if 'order_by' in data:
        order = data['order_by']
        if order == 'option':
            votes_all = votes_all.order_by('option__name')
        elif order == '-option':
            votes_all = votes_all.order_by('-option__name')
        elif order == 'email':
            votes_all = votes_all.order_by('voter__ref')
        elif order == '-email':
            votes_all = votes_all.order_by('-voter__ref')

    votes = list(map(lambda vote: {
        'option': vote.option.name,
        'voter': vote.voter.ref
    },
        votes_all[(page-1)*per_page:per_page]
    ))    
    return Response(votes)