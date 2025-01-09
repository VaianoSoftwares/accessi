FROM node:latest

ARG HTTP_PORT
ARG HTTPS_PORT

WORKDIR /app

COPY . .
RUN npm install
RUN (cd client && npm install)
COPY . .

EXPOSE ${HTTP_PORT}
EXPOSE ${HTTPS_PORT}

CMD ["npm", "start"]
