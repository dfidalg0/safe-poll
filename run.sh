#! /bin/bash

cd server && gunicorn -b 0.0.0.0:$PORT safepoll.wsgi
