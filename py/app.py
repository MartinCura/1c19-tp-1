#!/usr/bin/env python3
from flask import Flask
import time
import math

TIMEOUT = 5
MAX_FIBONACCI = 1000  # Takes about 8 s in my config

def fibonacci(n):
    resultado = 1
    for j in range(n):
        resultado = resultado * ((1 + math.sqrt(5))/2)
    resultado = resultado / math.sqrt(5) + 0.5

    return math.floor(resultado)

app = Flask(__name__)


@app.route("/")
def root():
    return """/health
              /proxy
              /intensiveLoop"""


@app.route("/health")
def health_check():
    return "Todo anda bien, Milhouse"

@app.route("/proxy")
def timeout():
    time.sleep(TIMEOUT)
    return "Oof"

@app.route("/intensive")
def intensive():
    numeros = []
    for i in range(MAX_FIBONACCI):
        numeros.append(fibonacci(i))
    return "All done:\n{}".format(numeros)

if __name__ == "__main__":
    app.run()
