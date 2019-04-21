FROM python:3.6.7

ENV GUNICORN_WORKERS 1

WORKDIR /app

COPY requirements.txt .

RUN pip3 install -r requirements.txt

COPY app.py .

CMD gunicorn --reload -b 0.0.0.0:8000 -w $GUNICORN_WORKERS app:app
