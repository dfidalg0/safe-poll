from celery import shared_task


@shared_task
def teste():
    print('Teste')


