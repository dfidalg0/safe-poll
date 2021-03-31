release: cd server && python manage.py migrate
web: cd server && gunicorn -b 0.0.0.0:$PORT safepoll.wsgi
worker: cd server && celery -A safepoll worker -l INFO --without-heartbeat --without-gossip --without-mingle
