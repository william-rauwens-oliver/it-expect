FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --only=production
COPY ledger ./ledger
EXPOSE 5000
CMD ["node", "ledger/server.js"]
