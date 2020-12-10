release: cd server && python manage.py migrate
web: cd server && gunicorn -b 0.0.0.0:$PORT safepoll.wsgi
worker: cd server/safepoll && celery -A celery worker --loglevel=INFO -E
