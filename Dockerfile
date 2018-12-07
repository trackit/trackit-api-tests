FROM node:8

WORKDIR /app
COPY ./ ./
RUN npm install

CMD ["node", "/app/index.js"]
