Here is your **clean README.md**.
You can copy this directly into your `README.md` file.

---

```markdown
# 📌 User Notes API (Django + JWT)

## 📖 Project Overview

This project is a **User Notes REST API** built using **Django** and **Django REST Framework** with **JWT Authentication**.

Each authenticated user can:

- Login using JWT
- Create personal notes
- View their own notes
- Update their notes
- Delete their notes

All responses are JSON and REST-compliant.

---

## 🚀 Tech Stack

- Python
- Django
- Django REST Framework (DRF)
- SimpleJWT (JWT Authentication)
- SQLite (default database)
- Postman (API testing)

---

## 📂 Project Structure

```

week5/
│
├── notes_project/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── notes/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── ...
│
└── manage.py

```

---

## 🔐 Authentication

JWT Authentication is implemented using `djangorestframework-simplejwt`.

### Login Endpoint



POST /api/login/



### Request Body

json
{
  "username": "your_username",
  "password": "your_password"
}


### Response

json
{
  "refresh": "refresh_token",
  "access": "access_token"
}


Use the **access token** in the Authorization header:


Authorization: Bearer <access_token>


---

## 📌 API Endpoints

### 1️⃣ Get All Notes (User-Specific)


GET /api/notes/


Returns only the logged-in user's notes.

---

### 2️⃣ Create Note


POST /api/notes/


Request Body:

json
{
  "title": "My Note",
  "content": "Note content"
}


---

### 3️⃣ Update Note


PUT /api/notes/{id}/


Request Body:

json
{
  "title": "Updated Title",
  "content": "Updated content"
}




### 4️⃣ Delete Note


DELETE /api/notes/{id}/


Response:


204 No Content


---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository


git clone <repo_url>
cd week5


### 2️⃣ Create Virtual Environment


python -m venv venv


### 3️⃣ Activate Virtual Environment

**Windows**


venv\Scripts\activate


**Mac/Linux**

source venv/bin/activate


### 4️⃣ Install Dependencies


pip install django djangorestframework djangorestframework-simplejwt


### 5️⃣ Run Migrations


python manage.py migrate


### 6️⃣ Create Superuser (Optional)


python manage.py createsuperuser


### 7️⃣ Run Server


python manage.py runserver


Server runs at:


http://127.0.0.1:8000/


---

## 🧪 Testing

API endpoints were tested using **Postman**.

Included in submission:

* Postman Collection (JSON export)

---

## 🔒 Security Features

* JWT-based authentication
* User-specific data filtering
* Protected CRUD operations
* REST-compliant JSON responses

---

## 🎯 Assignment Requirements Covered

* Project structure
* MVT pattern
* First API endpoint returning JSON
* JWT login
* CRUD operations
* User-specific notes
* JSON REST-compliant responses
* Postman collection

---

## 👨‍💻 Author

**Rohit Mohan**
Week 5 Assignment – Django REST API with JWT

