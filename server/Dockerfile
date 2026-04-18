FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port (adjust if your app uses a different port)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
