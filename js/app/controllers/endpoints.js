const TIME = process.env.DELAY_TIME_MILLISECONDS || 5000;
const MAX_NUMBER = process.env.MAX_NUMBER || 5000000;

const delay = time => new Promise((resolve, reject) => setTimeout(() => resolve(), time));

const isPrime = number => {
  for (let i = 2; i < Math.floor(Math.sqrt(number)); i++) {
    if (number % i === 0) {
      return false;
    }
  }
  return number !== 1;
};

exports.healthCheck = (_, res) => res.status(203).send({ uptime: process.uptime() });

exports.ping = (_, res) => delay(TIME).then(() => res.status(200).send());

exports.intensiveLoop = (_, res) => {
  const primeNumbers = [];

  for (let j = 2; j < MAX_NUMBER; j++) {
    if (isPrime(j)) {
      primeNumbers.push(j);
    }
  }

  return res.status(200).send({ numbers: primeNumbers });
};
