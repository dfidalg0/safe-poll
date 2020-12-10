release: cd server && python manage.py migrate
web: cd server && gunicorn -b 0.0.0.0:$PORT safepoll.wsgi
worker: celery -A server worker -l INFO
celery: celery -A safe-poll worker  -l info --beat -b $BROKER_URL
