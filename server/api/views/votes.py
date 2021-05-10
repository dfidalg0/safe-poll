from .context import *
import xlwt
from django.http import HttpResponse

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
    
    votes_all = Vote.objects.filter(poll=poll)

    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; filename=' + poll.title

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