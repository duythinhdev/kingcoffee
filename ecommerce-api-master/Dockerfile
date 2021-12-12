FROM node:11-alpine

RUN mkdir -p /app

WORKDIR /app
EXPOSE 7001

COPY . .
RUN npm config set unsafe-perm true
RUN npm install

CMD ["npm", "start"]