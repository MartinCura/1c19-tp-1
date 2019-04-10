#!/usr/bin/env python3
from flask import Flask
import time
import math

TIMEOUT = 5
MAX_PRIMO = 2_000_000  # Takes about 8 s in my config


def is_primo(n):
    for j in range(2, math.floor(math.sqrt(n))+1):
        if n % j == 0:
            return False
    return True


app = Flask(__name__)


@app.route("/")
def root():
    return """/health
              /timeout
              /intensiveLoop"""


@app.route("/health")
def health_check():
    return "Todo anda bien, Milhouse"


@app.route("/timeout")
def timeout():
    time.sleep(TIMEOUT)
    return "Oof"


@app.route("/intensiveLoop")
def intensiveLoop():
    primos = []
    for i in range(MAX_PRIMO):
        if is_primo(i):
            primos.append(i)
    return "All done:\n{}".format(primos)


if __name__ == "__main__":
    app.run()
