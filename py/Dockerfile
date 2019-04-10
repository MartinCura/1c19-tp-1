FROM python:3.6.7

WORKDIR /app

COPY requirements.txt .

RUN pip3 install -r requirements.txt

COPY app.py .

EXPOSE 8001:8001

CMD ["gunicorn", "--reload", "-b", "0.0.0.0:8001", "-w", "1", "app:app"]
