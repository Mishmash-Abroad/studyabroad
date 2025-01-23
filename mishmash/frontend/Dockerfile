FROM node:16-alpine

WORKDIR /app

# Add python and build tools for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source for production build
# In development, this will be overridden by the mounted volume
COPY . .

EXPOSE 3000

# If NODE_ENV=production, build static files, otherwise run dev server
CMD sh -c "if [ \"$NODE_ENV\" = \"production\" ]; then \
           echo 'Building production static files...' && \
           npm run build && \
           echo 'Build complete. Static files are in /app/build' && \
           tail -f /dev/null; \
           else \
           npm start; \
           fi"
