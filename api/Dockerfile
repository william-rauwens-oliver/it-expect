FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --only=production
COPY api ./api
EXPOSE 4000
CMD ["node", "api/server.js"]
