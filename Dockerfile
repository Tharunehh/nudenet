FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json ./
RUN npm ci --legacy-peer-deps --prefer-offline || npm install --legacy-peer-deps

COPY dist/ ./dist/
COPY models/ ./models/
COPY public/ ./public/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
