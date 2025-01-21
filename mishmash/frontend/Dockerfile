FROM node:16-alpine

WORKDIR /app

# Add python and build tools for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies 
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

EXPOSE 3000

# Use environment variable to determine whether to build and serve, or just serve in dev mode
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && echo 'Production build complete'; else npm start; fi"]
