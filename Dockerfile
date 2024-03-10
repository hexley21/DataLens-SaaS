FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

COPY data-design.sql /docker-entrypoint-initdb.d/

RUN npm install --verbose

ENV NODE_ENV production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]