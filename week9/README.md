# 🛒 Week 9: Advanced ORM & E-commerce API

## 📌 Project Overview
Welcome to the **Week 9: E-commerce Backend**! This project is a robust REST API built using **Django** and **Django REST Framework (DRF)**.

The primary focus of this week was to master **Advanced ORM techniques**, including complex aggregations, efficient filtering, and search functionality, while maintaining a clean and scalable API structure.

---

## 🚀 Quick Start Guide (First-Time Users)

Follow these steps to get the system up and running on your local machine:

### 1. Environment Setup
Ensure you have Python installed, then install the necessary dependencies:
```bash
pip install django djangorestframework django-filter django-cors-headers
```

### 2. Database Initialization
Apply the migrations to set up your SQLite database:
```bash
python manage.py migrate
```

### 3. Population with Seed Data
To test the API immediately, run the provided seed script. This will create categories, several products, and a sample cart:
```bash
python seed_data.py
```

### 4. Start the Development Server
```bash
python manage.py runserver
```
The API will be available at: **`http://127.0.0.1:8000/`**

---

## 🛠 Features & Technical Highlights

### 1. Database Architecture (Models)
The system is built on four core models:
- **Category**: Organized product groups with auto-generated slugs.
- **Product**: Detailed items with price, stock, and category relationships.
- **Cart**: A user-specific container for shopping (One-to-One with User).
- **CartItem**: Junction model for products within a cart, including quantity.

### 2. Advanced ORM & Aggregations
We utilized powerful Django ORM features to provide dynamic data:
- **`annotate(Count('products'))`**: Automatically calculates the number of products in each category.
- **`Sum(F('product__price') * F('quantity'))`**: Dynamically calculates the total price of a cart by multiplying item prices with their quantities.
- **`slugify`**: Ensuring SEO-friendly URLs for categories and products.

### 3. Search & Filtering
The product endpoint is equipped with advanced querying capabilities:
- **Search**: Search through product `name` and `description` using `?search=term`.
- **Category Filter**: Filter by category slug using `?category=electronics`.
- **Price Range**: Use `?min_price=X` and `?max_price=Y` to find products within a specific budget.
- **Ordering**: Sort by price or creation date using `?ordering=price`.

### 4. Pagination
To ensure performance with large datasets, the API defaults to **10 items per page**. Use the `?page=N` parameter to navigate.

---

## 🔐 Authentication & Security

This API uses **Token-Based Authentication**.

### How to Authenticate:
1. **Register** a new user at `/api/register/`.
2. **Login** at `/api/login/` to receive your unique **Authentication Token**.
3. **Include the Token** in the header of your protected requests (like managing your cart):
   - **Header Key**: `Authorization`
   - **Header Value**: `Token <your_token_key>`

---

## 📑 API Endpoints Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/register/` | POST | Register a new user | No |
| `/api/login/` | POST | Login and get Token | No |
| `/api/products/` | GET | List all products (with Search/Filter) | No |
| `/api/categories/` | GET | List all categories with product counts | No |
| `/api/carts/` | GET | View your personal cart | **Yes** |
| `/api/carts/` | POST | Add items to your cart | **Yes** |

---

## 🧪 Testing with Postman

A pre-configured Postman collection is included in this folder:
- **File**: `postman_collection.json`
- **How to use**: Import the file into Postman to see example requests for every feature, including authentication and complex filtering.

---

## 👤 Author
**Rohit Mohan**  
*Week 9 - Internship to Hire Excellence Program (I2HEP)*
