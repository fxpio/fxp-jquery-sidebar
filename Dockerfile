FROM node:10

EXPOSE 9000

COPY . /app/
WORKDIR /app/

RUN npm i

CMD npm run serve-all
