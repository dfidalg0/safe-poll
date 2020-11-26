from celery import shared_task
from .models import (
        Poll,
        Token
        )

@shared_task
def schedule_poll_death(poll_id):
    poll = Poll.objects.get(pk=poll_id)
    token_list = Token.objects.filter(poll_id=poll.id).delete()
    print('Tokens from poll {} were deleted.')


