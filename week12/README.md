# 🚀 Week 12: Deployment & Production Configuration

## 📌 Project Overview
Welcome to **Week 12: E-commerce Backend - The Production Launch**! This week, we took our API from a local development state to a production-ready configuration.

The core objective was to ensure the application is secure, scalable, and persistently hosted in the cloud.

---

## 🛠 Production Features

### 1. Environment Management
We implemented `python-dotenv` to separate configuration from code.
- **Sensitive Data**: `SECRET_KEY` and `DATABASE_URL` are now loaded from environment variables.
- **Safety**: `DEBUG` is disabled by default in production.

### 2. Database Migration
We moved away from the local `sqlite3` file:
- **Production DB**: Configured to connect to **PostgreSQL** or **MySQL** via the `DATABASE_URL` standard.
- **Dynamic Configuration**: Uses `dj-database-url` to parse connection strings automatically.

### 3. Static & Media Handling
- **Static Files**: Integrated **WhiteNoise** to serve CSS, JS, and Admin assets efficiently.
- **Persistence (Bonus)**: Configured **AWS S3** support using `django-storages` and `boto3` to ensure user-uploaded images are never lost.

### 4. Application Server
- **Gunicorn**: Switched from `runserver` to `Gunicorn` (Green Unicorn), a production-grade WSGI HTTP Server.

---

## 📑 Setup & Deployment

### 1. Prerequisites
Install all dependencies (including production packages):
```bash
pip install -r requirements.txt
```

### 2. Deployment Guide
Detailed step-by-step instructions for deploying to **Render** can be found in:
👉 [DEPLOYMENT_GUIDE.md](file:///c:/INV_INT_13_Rohit-Mohan/week12/DEPLOYMENT_GUIDE.md)

---

## 🧪 Verification
To ensure the app is ready for the cloud, run:
```bash
python manage.py check --deploy
```

## 👤 Author
**Rohit Mohan**  
*Week 12 - Internship to Hire Excellence Program (I2HEP)*
