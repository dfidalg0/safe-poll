from .context import *

@api_view(['POST'])
@with_rules({
    'token': lambda v: type(v) == str,
    'option_id': lambda v: is_unique_list(v),
    'poll_id': is_unsigned_int
})
def compute_vote(request: CleanRequest) -> Response:
    data = request.clean_data
    option_ids = data['option_id']
    del data["option_id"]

    try:
        token = Token.objects.get(token=data['token'], poll_id=data['poll_id'])

        options = []
        for option_id in option_ids:
            options.append( Option.objects.get(pk=option_id, poll_id=data['poll_id']) )


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
       # with transaction.atomic():

        if  poll.type.id == 1 : 
            
            if len(options) > 1:
                return Response({
                'message': 'Número incorreto de opções selecionadas'
                })  ## status = 


            vote = Vote(poll=poll, option=options[0])
            vote.ranking = 1
            if not poll.secret_vote:
                vote.voter = user

            vote.save()


        elif poll.type.id == 2 :
            for option in options :
                
                vote = Vote(poll=poll, option=option)
                vote.ranking = 1
                if not poll.secret_vote:
                    vote.voter = user
                vote.save()

        poll.emails_voted.add(user)
        poll.save()
        token.delete()
    except:
        return Response({
            'message': 'Erro Interno do Servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    conclusion = {}
    return Response(conclusion)
