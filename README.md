# studyabroad
app


## Database Management

### 1. Backup Procedures

#### Local Development Backup

```bash
# Backup database
docker-compose exec db pg_dump -U postgres postgres > backup.sql

# Backup with timestamp
timestamp=$(date +%Y%m%d_%H%M%S)
docker-compose exec db pg_dump -U postgres postgres > backup_${timestamp}.sql

# Backup specific tables
docker-compose exec db pg_dump -U postgres -t table_name postgres > table_backup.sql
```

#### Production Backup

```bash
# Full backup with compression
docker-compose exec db pg_dump -U postgres postgres | gzip > backup.sql.gz

# Automated daily backups (add to crontab)
0 0 * * * /path/to/backup-script.sh

# Backup to remote storage (example with AWS S3)
docker-compose exec db pg_dump -U postgres postgres | gzip | aws s3 cp - s3://bucket/backup_$(date +%Y%m%d).sql.gz
```

### 2. Restore Procedures

#### Local Development Restore

```bash
# Stop dependent services
docker-compose stop backend

# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres postgres

# Start services
docker-compose start backend
```

#### Production Restore

```bash
# 1. Stop application
docker-compose stop backend

# 2. Drop existing database (if needed)
docker-compose exec db dropdb -U postgres postgres
docker-compose exec db createdb -U postgres postgres

# 3. Restore from backup
gunzip -c backup.sql.gz | docker-compose exec -T db psql -U postgres postgres

# 4. Start application
docker-compose start backend
```

### 3. Maintenance Procedures

1. **Regular Maintenance**: ?idk what this does
   ```bash
   # Vacuum database
   docker-compose exec db vacuumdb -U postgres -d postgres --analyze

   # Reindex database
   docker-compose exec db reindexdb -U postgres postgres
   ```

2. **Monitoring**:
   ```bash
   # Check database size
   docker-compose exec db psql -U postgres -c "\l+"

   # Check table sizes
   docker-compose exec db psql -U postgres -c "\dt+"
   ```

3. **Performance Tuning**:
   ```bash
   # Show slow queries
   docker-compose exec db psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
   ```

### 4. Backup Retention Policy

1. **Development Environment**:
   - Keep last 7 daily backups
   - Automated cleanup of old backups

2. **Production Environment**:
   - Daily backups: retain for 7 days
   - Weekly backups: retain for 1 month
   - Monthly backups: retain for 1 year

## Docker Setup

### Docker Compose Overview

```yaml
services:
  backend:    # Django API
  frontend:   # React SPA
  nginx:      # Reverse Proxy
  db:         # PostgreSQL
```

### 1. Backend (Django)

**Dockerfile:**
```dockerfile
FROM python:3.9

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
```

**Key Features:**
- Python 3.9 base image
- Dependencies installed from requirements.txt
- Development server on port 8000
- Volume mounts for hot reloading
- Static/media file volumes

### 2. Frontend (React)

**Dockerfile:**
```dockerfile
FROM node:16

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Key Features:**
- Node.js 16 base image
- npm for package management
- Development server on port 3000
- Volume mounts for hot reloading
- Build volume for production

### 3. Nginx (Reverse Proxy)

**Dockerfile:**
```dockerfile
FROM nginx:1.21-alpine

RUN rm /etc/nginx/conf.d/default.conf

# SSL directory
RUN mkdir -p /etc/nginx/ssl

# Config files
COPY dev.conf /etc/nginx/conf.d/dev.conf
COPY prod.conf /etc/nginx/conf.d/prod.conf

# Static file directories
RUN mkdir -p /app/static /app/media /app/frontend

# Environment-based config selection
ENV NGINX_CONFIG=dev
CMD sh -c "if [ "$NGINX_CONFIG" = "prod" ]; then \
           cp /etc/nginx/conf.d/prod.conf /etc/nginx/conf.d/default.conf; \
         else \
           cp /etc/nginx/conf.d/dev.conf /etc/nginx/conf.d/default.conf; \
         fi && \
         nginx -g 'daemon off;'"
```

### 4. Docker Compose Configuration

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    volumes:
      - ./backend:/app
      - static_volume:/app/static
      - media_volume:/app/media
    environment:
      - DEBUG=1
      - DJANGO_ALLOWED_HOSTS=localhost dev-mishmash.colab.duke.edu mishmash.colab.duke.edu
    depends_on:
      - db

  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - build_volume:/app/build
    environment:
      - NODE_ENV=development

  nginx:
    build: ./nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media
      - build_volume:/app/frontend
      - ./nginx/ssl:/etc/nginx/ssl
    environment:
      - NGINX_CONFIG=${NGINX_CONFIG:-dev}
    depends_on:
      - backend
      - frontend

  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

volumes:
  postgres_data:
  static_volume:
  media_volume:
  build_volume:
```

### Development Workflow

1. **Start Development Environment:**
   ```bash
   docker-compose up --build
   ```

2. **Start Production Environment:**
   ```bash
   NGINX_CONFIG=prod docker-compose up --build
   ```

3. **Access Services:**
   - Development:
     - Frontend: https://dev-mishmash.colab.duke.edu
     - API: https://dev-mishmash.colab.duke.edu/api/
     - Admin: https://dev-mishmash.colab.duke.edu/admin/

   - Production:
     - Frontend: https://mishmash.colab.duke.edu
     - API: https://mishmash.colab.duke.edu/api/
     - Admin: https://mishmash.colab.duke.edu/admin/

### Volume Management

- **postgres_data**: Persistent database storage
- **static_volume**: Django static files
- **media_volume**: User-uploaded content
- **build_volume**: React production build

### Environment Variables

1. **Backend:**
   - `DEBUG`: Debug mode
   - `DJANGO_ALLOWED_HOSTS`: Allowed host domains

2. **Frontend:**
   - `NODE_ENV`: Development/production mode

3. **Nginx:**
   - `NGINX_CONFIG`: Configuration environment (dev/prod)

4. **Database:**
   - `POSTGRES_DB`: Database name
   - `POSTGRES_USER`: Database user
   - `POSTGRES_PASSWORD`: Database password

## Docker Testing

### Local Development
```bash
# Start all services in development mode
docker compose up

# Access Points:
- Frontend (Direct): http://localhost:3000
- Backend API (Direct): http://localhost:8000
- Through Nginx: http://localhost:8080
```

### Production Testing
```bash
# Start with production configuration
NGINX_CONFIG=prod docker compose up

# Access Points:
- Main Application: https://localhost:8443
- API: https://localhost:8443/api/
- Admin: https://localhost:8443/admin/
```

### Common Docker Commands
```bash
# Rebuild all images
docker compose build

# Start specific service
docker compose up backend

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Remove volumes (clean state)
docker compose down -v
```

### Troubleshooting
1. Port Conflicts
```bash
# Check ports in use
sudo lsof -i :8080
sudo lsof -i :8443
sudo lsof -i :8000
sudo lsof -i :3000
```

2. Container Issues
```bash
# Check container status
docker compose ps

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
```

3. SSL Certificate Issues
```bash
# Verify certificate paths
docker compose exec nginx ls -l /etc/nginx/ssl/
```

## Nginx Configuration

Our Nginx setup consists of three main configuration files:

### 1. Base Configuration (nginx.conf)
The base configuration handles routing between services:

- **Upstream Definitions**:
  - `backend`: Django server on port 8000
  - `frontend`: React server on port 3000

- **Route Handling**:
  - `/api/*`: Routes to Django backend
  - `/admin/*`: Routes to Django admin interface
  - `/*`: Routes to React frontend

- **Proxy Headers**:
  - Preserves client IP addresses
  - Maintains original host headers
  - Handles secure redirects

### 2. Development Configuration (dev.conf)
Optimized for development environment at `dev-mishmash.colab.duke.edu`:

- **React Development**:
  - Proxies to React dev server (port 3000)
  - Supports WebSocket for hot reloading
  - Minimal caching for rapid development

- **SSL/HTTPS**:
  - Uses Duke Locksmith certificates
  - TLS 1.2/1.3 protocols
  - Automatic HTTP to HTTPS redirection

### 3. Production Configuration (prod.conf)
Production-ready setup at `mishmash.colab.duke.edu`:

- **Security Headers**:
  - HSTS (HTTP Strict Transport Security)
  - XSS Protection
  - Clickjacking Prevention
  - MIME Type Sniffing Protection

- **Static File Serving**:
  - `/static/*`: Django static files
  - `/media/*`: User uploaded content
  - Aggressive caching (1 year expiration)
  - Cache-Control headers

- **React Production**:
  - Serves static build files
  - SPA fallback routing
  - 1-hour cache for HTML/JS/CSS

### SSL Certificates
Certificates are managed through Duke's Locksmith service:

```bash
# Install certbot on VCM server
sudo apt install certbot

# Request certificate
sudo certbot --server https://locksmith.oit.duke.edu/acme/v2/directory \
             --email [netid]@duke.edu \
             --agree-tos \
             --no-eff-email \
             -d [domain].colab.duke.edu
```

### Environment Selection
The Nginx container selects configuration based on the `NGINX_CONFIG` environment variable:

```bash
# Development
NGINX_CONFIG=dev docker-compose up

# Production
NGINX_CONFIG=prod docker-compose up
```

### Key Differences: Dev vs Prod

1. **React Handling**:
   - Dev: Hot-reload enabled dev server
   - Prod: Static file serving with caching

2. **Security**:
   - Dev: Basic SSL
   - Prod: Additional security headers

3. **Caching**:
   - Dev: Minimal for development
   - Prod: Aggressive for performance

4. **Static Files**:
   - Dev: Served through dev servers
   - Prod: Direct Nginx serving with caching

## Testing Docker Setup

### 1. Verify Services

```bash
# Check all containers are running
docker-compose ps

# Expected output:
#          Name                     Command              State                    Ports
# -------------------------------------------------------------------------------------------------
# studyabroad_backend_1   python manage.py runserver ...   Up      8000/tcp
# studyabroad_db_1        docker-entrypoint.sh postgres   Up      5432/tcp
# studyabroad_frontend_1  npm start                       Up      3000/tcp
# studyabroad_nginx_1     nginx -g daemon off;            Up      0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 2. Check Logs

```bash
# All services
docker-compose logs

# Individual services
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
docker-compose logs db
```

### 3. Test Individual Components
- not sure about health api 
```bash
# 1. Backend Health
curl http://localhost:8000/api/health/
# or with HTTPS
curl https://dev-mishmash.colab.duke.edu/api/health/

# 2. Frontend Build
docker-compose exec frontend npm run build

# 3. Database Connection
docker-compose exec backend python manage.py dbshell

# 4. Nginx Configuration
docker-compose exec nginx nginx -t
```

### 4. Common Issues

1. **Port Conflicts**:
```bash
# Check for port usage
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :8000
sudo lsof -i :3000
```

2. **Permission Issues**:
```bash
# Fix volume permissions
sudo chown -R $USER:$USER .
```

3. **SSL Certificate Issues**:
```bash
# Verify certificate paths
docker-compose exec nginx ls -l /etc/nginx/ssl/

# Test SSL configuration
openssl s_client -connect dev-mishmash.colab.duke.edu:443 -servername dev-mishmash.colab.duke.edu
```


### 6. Security Tests

```bash
# 1. Check exposed ports
docker-compose port nginx 80
docker-compose port nginx 443

# 2. Verify SSL configuration
nmap -p 443 --script ssl-enum-ciphers dev-mishmash.colab.duke.edu

# 3. Check container security
docker-compose exec nginx nginx -V
docker-compose exec backend pip list  # Check package versions
```

### 7. Cleanup Testing

```bash
# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build