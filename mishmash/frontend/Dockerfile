FROM node:16-alpine

WORKDIR /app

# Add Python and build tools for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source for production build
COPY . .

EXPOSE 3000

# If NODE_ENV=production, build static files and serve them, otherwise run dev server
CMD sh -c "if [ \"$NODE_ENV\" = \"production\" ]; then \
           echo 'Building production static files...' && \
           npm run build && \
           echo 'Build complete. Serving files...' && \
           npx serve -s build -l 3000; \
           else \
           npm start; \
           fi"
