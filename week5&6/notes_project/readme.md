# 📌 User Notes API (Django + JWT + ORM Relationships)

## 📖 Project Overview

This project is a **User Notes REST API** built using **Django** and **Django REST Framework** with **JWT Authentication**.

Each authenticated user can:

- Login using JWT
- Create personal notes
- Assign categories to notes
- Add multiple tags to notes
- View their own notes
- Update their notes
- Delete their notes
- Filter notes by category
- Filter notes by tag
- Search notes by keyword

All responses are JSON and REST-compliant.

---

# 🚀 Tech Stack

- Python
- Django
- Django REST Framework (DRF)
- SimpleJWT (JWT Authentication)
- SQLite
- Postman (API testing)

---

# 📂 Project Structure


week5/
│
├── notes_project/
│ ├── settings.py
│ ├── urls.py
│ └── ...
│
├── notes/
│ ├── models.py
│ ├── serializers.py
│ ├── views.py
│ ├── urls.py
│ └── ...
│
└── manage.py


---

# 🔐 Authentication

JWT Authentication is implemented using `djangorestframework-simplejwt`.

## Login Endpoint


POST /api/token/


### Request Body

```json
{
  "username": "your_username",
  "password": "your_password"
}
Response
{
  "refresh": "refresh_token",
  "access": "access_token"
}

Use the access token in Authorization header:

Authorization: Bearer <access_token>
🗂️ Data Relationships

This project implements ORM relationships:

Category → One-to-Many

One category can have multiple notes.

Category
   ├── Note
   ├── Note
   └── Note
Tags → Many-to-Many

A note can have multiple tags and a tag can belong to multiple notes.

Note ⇄ Tags
📌 API Endpoints
1️⃣ Create Category
POST /categories/

Request Body:

{
  "name": "Study"
}
2️⃣ Create Tag
POST /tags/

Request Body:

{
  "name": "django"
}
3️⃣ Create Note
POST /notes/

Request Body:

{
  "title": "Learn Django ORM",
  "content": "Understand relationships",
  "category": 1,
  "tags": [1]
}
4️⃣ Get All Notes
GET /notes/

Returns all notes belonging to the logged-in user.

5️⃣ Filter Notes by Category
GET /notes/?category=1
6️⃣ Filter Notes by Tag
GET /notes/?tag=django
7️⃣ Search Notes
GET /notes/?search=django

Searches in title and content.

🛠️ Installation & Setup
1️⃣ Clone Repository
git clone <repo_url>
cd week5
2️⃣ Create Virtual Environment
python -m venv venv
3️⃣ Activate Virtual Environment
Windows
venv\Scripts\activate
Mac/Linux
source venv/bin/activate
4️⃣ Install Dependencies
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
5️⃣ Run Migrations
python manage.py migrate
6️⃣ Create Superuser (Optional)
python manage.py createsuperuser
7️⃣ Run Server
python manage.py runserver

Server runs at:

http://127.0.0.1:8000/
🧪 Testing

API endpoints were tested using Postman.

Screenshots included for:

Token generation

Create category

Create tag

Create note

Filter notes by category

Filter notes by tag

Keyword search

🔒 Security Features

JWT Authentication

User-specific notes

Protected API endpoints

REST-compliant responses

🎯 Assignment Requirements Covered

✔ Models and migrations
✔ One-to-many relationship (Category → Notes)
✔ Many-to-many relationship (Notes ↔ Tags)
✔ Queryset filtering
✔ Keyword search
✔ JWT authentication
✔ Postman API testing

👨‍💻 Author

Rohit Mohan

Week 6 Assignment – Django REST API with ORM Relationships


---

✅ Use this as your **final README** before pushing.

After pasting into `README.md`, run:

```bash
git add README.md
git commit -m "Update README with categories, tags, filtering and search"
git push