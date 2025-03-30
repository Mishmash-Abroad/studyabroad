FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (merged into a single command)
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    default-libmysqlclient-dev \
    pkg-config \
    cron \
    procps \
    bash \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Ensure cron directory exists
RUN mkdir -p /var/spool/cron/crontabs && chmod 777 /var/spool/cron/crontabs

# Upgrade pip
RUN pip install --upgrade pip

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Ensure cron log file exists and is writable
RUN touch /var/log/cron.log && chmod 666 /var/log/cron.log

# Create a script that will be executed by cron with the proper environment
COPY run_backup.sh /app/run_backup.sh

RUN chmod +x /app/run_backup.sh

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
