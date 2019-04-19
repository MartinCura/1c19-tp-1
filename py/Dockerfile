FROM python:3.6.7

WORKDIR /app

COPY requirements.txt .

RUN pip3 install -r requirements.txt

COPY app.py .

CMD ["gunicorn", "--reload", "-b", "0.0.0.0:8000", "-w", "1", "app:app"]
