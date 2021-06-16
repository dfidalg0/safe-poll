from .context import *
import xlwt
from django.http import HttpResponse

@api_view(['POST'])
@with_rules({
    'token': lambda v: type(v) == str,
    'perm': lambda v: type(v) == bool,
    'option_id': lambda v: len(v) > 0 ,
    'poll_id': is_unsigned_int
})
def compute_vote(request: CleanRequest) -> Response:
    data = request.clean_data

    permanent = data['perm']

    poll = None
    token = None
    user = None
    options = None

    option_ids = data['option_id']
    del data['option_id']

    if not permanent:
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
    else:
        try:
            poll = Poll.objects.get(pk=data['poll_id'], permanent_token=data['token'])
            options = []
            for option_id in option_ids:
                options.append( Option.objects.get(pk=option_id, poll_id=data['poll_id']) )

        except Poll.DoesNotExist:
            return Response({
                'message': 'Eleição não encontrada'
            }, status=HTTP_404_NOT_FOUND)

        except Option.DoesNotExist:
            return Response({
                'message': 'Opção não encontrada'
            }, status=HTTP_404_NOT_FOUND)

    try:
        with transaction.atomic():
            
            if  poll.type.id == 1 or poll.type.id == 4:
                if len(options) is not 1 :
                    return Response({
                        'message': 'Número incorreto de opções selecionadas'
                    }, status = HTTP_422_UNPROCESSABLE_ENTITY)

            elif poll.type.id == 2 :
                if len(options) == 0:
                    return Response({
                        'message': 'Número incorreto de opções selecionadas'
                    } , status = HTTP_422_UNPROCESSABLE_ENTITY)

            elif poll.type.id == 3 or poll.type.id == 5 or poll.type.id == 6:
                if len(options) == 0 or len(options) > poll.votes_number:
                    return Response({
                        'message': 'Número incorreto de opções selecionadas'
                    } , status = HTTP_422_UNPROCESSABLE_ENTITY)

            
            if user:
                poll.emails_voted.add(user)

            for option in options :

                vote = Vote(poll=poll, option=option)
                vote.ranking = 1
                if user and not poll.secret_vote:
                    vote.voter = user
                vote.save() 

            poll.save()
            if token:
                token.delete()
    except:
        return Response({
            'message': 'Erro Interno do Servidor'
        }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    conclusion = {}
    return Response(conclusion)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_poll_votes(request: Request, pk: int) -> Response:
    try:
        admin = request.user
        poll = Poll.objects.get(pk=pk, admin=admin)

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    if poll.secret_vote:
        return Response({
            'message': 'Eleição secreta!'
        }, status=HTTP_400_BAD_REQUEST)

    votes_all = Vote.objects.filter(poll=poll)

    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('perPage', 10))
    email_filter = request.GET.get('emailFilter', None)
    order_by = request.GET.get('orderBy', None)

    if email_filter:
        users_filter = UserAccount.objects.filter(ref__startswith = email_filter)
        votes_all = votes_all.filter(voter__in = users_filter)

    data = request.data
    if 'optionsFilter' in data:
        votes_all = votes_all.filter(option__name__in = data['optionsFilter'])

    if order_by:
        if order_by == 'option':
            votes_all = votes_all.order_by('option__name')
        elif order_by == '-option':
            votes_all = votes_all.order_by('-option__name')
        elif order_by == 'voter':
            votes_all = votes_all.order_by('voter__ref')
        elif order_by == '-voter':
            votes_all = votes_all.order_by('-voter__ref')

    total = len(votes_all)

    votes = list(map(lambda vote: {
        'id': vote.pk,
        'option': vote.option.name,
        'voter': vote.voter.ref
    },
        votes_all[(page-1)*per_page:(page-1)*per_page+per_page]
    ))
    return Response({"total": total, "votes": votes})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_votes(request: Request, pk: int) -> HttpResponse:
    try:
        admin = request.user
        poll = Poll.objects.get(pk=pk, admin=admin)

    except Poll.DoesNotExist:
        return Response({
            'message': 'Eleição não encontrada'
        }, status=HTTP_404_NOT_FOUND)

    if poll.secret_vote:
        return Response({
            'message': 'Eleição secreta!'
        }, status=HTTP_400_BAD_REQUEST)

    votes_all = Vote.objects.filter(poll=poll)

    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; filename="SafePoll.xls"'

    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet(poll.title)

    row_num = -1
    font_style = xlwt.XFStyle()

    rows = votes_all.values_list('voter__ref', 'option__name')
    for row in rows:
        row_num += 1
        for col_num in range(len(row)):
            ws.write(row_num, col_num, row[col_num], font_style)

    wb.save(response)
    return response
