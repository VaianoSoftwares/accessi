FROM node:latest

WORKDIR /vero-open
COPY . .
RUN npm install
RUN (cd client && npm install)
CMD ["npm", "start"]
