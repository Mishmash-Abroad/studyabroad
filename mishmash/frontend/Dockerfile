FROM node:16-alpine

WORKDIR /app

# Add Python and build tools for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 3000

# Run development server
CMD ["npm", "start"]
