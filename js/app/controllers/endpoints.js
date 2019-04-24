const TIME = process.env.DELAY_TIME_MILLISECONDS || 5000;

const delay = time => new Promise((resolve, reject) => setTimeout(() => resolve(), time));

const fibonacci = n => {
  result = 1

  for (let i = 0; i < n; i++){
    result = result*((1 + Math.sqrt(5))/2);
  }
  result = result/Math.sqrt(5) + 0.5

  return Math.floor(result);
};

exports.healthCheck = (_, res) => res.status(200).send({ uptime: process.uptime() });

exports.proxy = (_, res) => delay(TIME).then(() => res.status(200).send());

exports.intensiveLoop = (_, res) => {
  const numbers = [];
  for (let j = 1000; j < 5000; j++) {
    numbers.push(fibonacci(j));
  }
  return res.status(200).send({ numbers });
};