FROM nginx:1.21-alpine

RUN rm /etc/nginx/conf.d/default.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy configuration files
COPY dev.conf /etc/nginx/conf.d/dev.conf
COPY prod.conf /etc/nginx/conf.d/prod.conf

# Create directories for static files
RUN mkdir -p /app/static /app/media /app/frontend

# Use environment variable to determine which config to use
ENV NGINX_CONFIG=dev
CMD sh -c "if [ "$NGINX_CONFIG" = "prod" ]; then \
           cp /etc/nginx/conf.d/prod.conf /etc/nginx/conf.d/default.conf; \
         else \
           cp /etc/nginx/conf.d/dev.conf /etc/nginx/conf.d/default.conf; \
         fi && \
         nginx -g 'daemon off;'"
