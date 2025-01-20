FROM node:16-alpine

WORKDIR /app

# Add python and build tools for node-gyp
RUN apk add --no-cache python3 make g++
# Copy package files
COPY package*.json ./

# Install dependencies with increased memory limit and network timeout
RUN  npm install --legacy-peer-deps

# Copy project files
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
