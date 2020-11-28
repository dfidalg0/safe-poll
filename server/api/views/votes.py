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
