# Developer Guide

The following document describes the setup steps required to set up for development.

## 1. Clone the repository

`
git clone <repository url>
cd studyabroad
`

## 2. Set up a virtual environment

### Create the virtual environment
`
python -m venv venv
`

### Activate the virtual environment:

macOS/Linux
`
source venv/bin/activate
`

Windows
`
.\env\Scripts\activate
`

### Install dependencies

`
pip install -r requirements.txt
`

** Note: When installing future dependencies, make sure to update the requirements.txt file, using `pip freeze > requirements.txt` in the studyabroad directory

## 3. Install MySQL

### 1. Download and install MySQL

Make sure to remember your root password, and optionally add a new user (i.e. User: mishmash, Pass: <something you will remember>)

### 2. Open MySQL Workbench and create a new schema and name it something relevant to the project (i.e. study_abroad)

## Configure the .env file

Create a file called .env in the mishmash folder. Add the following:

```
DEBUG=True \
ALLOWED_HOSTS=127.0.0.1,localhost \
DATABASE_NAME=your_database_name \
DATABASE_USER=your_mysql_username \
DATABASE_PASSWORD=your_mysql_password \
DATABASE_HOST=127.0.0.1 \
DATABASE_PORT=3306 \
```

## Run Migrations

Run in the terminal/command prompt:

```
python manage.py makemigrations
python manage.py migrate
```

Add a superuser (this allows you to sign in to the admin panel)

`python manage.py createsuperuser`

## Start the Django server

`python manage.py runserver`

You should be able to see the following urls:

Admin: http://127.0.0.1:8000/admin/ \
API: http://127.0.0.1:8000/api/

## Install frontend dependencies

Make sure you have npm installed.

In a new terminal/command prompt, navigate to the frontend folder and run:

```
npm install
npm start
```

This will run the frontend server.