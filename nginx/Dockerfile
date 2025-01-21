FROM nginx:1.21-alpine

RUN rm /etc/nginx/conf.d/default.conf

# Copy main configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directories for static files
RUN mkdir -p /app/static /app/media /app/frontend

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

CMD ["nginx", "-g", "daemon off;"]
