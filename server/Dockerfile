# Use Node.js LTS
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose the port your server runs on
EXPOSE 5000

CMD ["node", "index.js"]