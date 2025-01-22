# prod start

docker compose -f docker-compose.prod.yml up




# prod.conf

server {
    listen 80;
    server_name mishmash.colab.duke.edu;

    # SSL configuration
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/mishmash.colab.duke.edu.crt;
    ssl_certificate_key /etc/nginx/ssl/mishmash.colab.duke.edu.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Serve static files directly
    location /static/ {
        alias /app/static/;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    location /media/ {
        alias /app/media/;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location /admin/ {
        proxy_pass http://backend:8000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    # Serve React static files
    location / {
        root /app/frontend;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }
}



# nginx.conf
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name localhost dev.studyabroad.local;
    
    # Static files
    location /static/ {
        alias /app/static/;
    }

    location /media/ {
        alias /app/media/;
    }
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}



# Docker

we have 2 docker compose files