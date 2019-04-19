FROM node:10.13.0

WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .
COPY .nvmrc .

RUN npm install

COPY . .

ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
