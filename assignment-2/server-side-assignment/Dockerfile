FROM node:20-alpine AS builder

WORKDIR /src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /src/app/package*.json ./

COPY --from=builder /src/app/dist ./dist

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/app.js"]
