
const config = require('../../config');

exports.healthCheck = (_, res) => res.status(200).send({ uptime: process.uptime() });

/* eslint-disable no-unused-vars */
const delay = time => new Promise((resolve, reject) => setTimeout(() => resolve(), time));
/* eslint-enable no-unused-vars */
const TIME = config.common.delay;

exports.timeout = (_, res) => delay(TIME).then(() => res.status(200).send());

const prime = number => {
  for (let i = 2; i < Math.floor(Math.sqrt(number)); i++) {
    if (number % i === 0) {
      return false;
    }
  }
  return number !== 1;
};

exports.intensiveLoop = (_, res) => {
  const c = 10000000;
  const primeNumbers = [];

  for (let j = 2; j < c; j++) {
    if (prime(j)) {
      primeNumbers.push(j);
    }
  }

  return res.status(200).send({ numbers: primeNumbers });
};
