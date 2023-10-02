FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

ARG API_URL
ENV API_URL=$API_URL

COPY . .

RUN npm run build

EXPOSE 8080:8080

CMD [ "npm", "run", "preview" ]