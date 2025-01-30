FROM node:16-alpine

WORKDIR /app

# Add Python and build tools for node-gyp
RUN apk add --no-cache python3 make g++

# Create and set permissions for build directory and npm cache
RUN mkdir -p /app/build && \
    chown -R node:node /app && \
    mkdir -p /home/node/.npm && \
    chown -R node:node /home/node/.npm

# Switch to non-root user
USER node

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source with correct ownership
COPY --chown=node:node . .

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
