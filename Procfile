release: cd server && python manage.py migrate
web: cd server && gunicorn -b 0.0.0.0:$PORT safepoll.wsgi
worker: celery worker --app=tasks.app
celery: celery worker -A safe-poll -l info --beat -b amqps://vawyyfrs:jqxN-3mnE9HYqhLr1_ZZ2Bb0k78b2htO@jellyfish.rmq.cloudamqp.com/vawyyfrs
