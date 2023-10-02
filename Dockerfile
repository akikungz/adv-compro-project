FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

ARG API_URL
ENV API_URL=$API_URL

COPY . .

EXPOSE 8080:8080

RUN npm run build

CMD ["npm", "run", "start"]