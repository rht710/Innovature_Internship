# 🛒 Week 10: File Uploads & Media Handling

## 📌 Project Overview
Welcome to **Week 10: E-commerce Backend - Media Edition**! This project builds on the robust REST API from Week 9, adding advanced capabilities for handling digital assets.

The primary focus of this week was to implement **secure file uploads**, **image validation**, and **automatic thumbnail generation** to create a professional-grade media handling pipeline for product images.

---

## 🚀 Quick Start Guide (First-Time Users)

Follow these steps to get the system up and running on your local machine:

### 1. Environment Setup
Ensure you have Python installed, then install the necessary dependencies (including **Pillow** for image processing):
```bash
pip install django djangorestframework django-filter Pillow
```

### 2. Database Initialization
Apply the migrations to set up your SQLite database:
```bash
python manage.py migrate
```

### 3. Population with Seed Data (Optional)
To test the API immediately with categories and products:
```bash
python seed_data.py
```

### 4. Start the Development Server
```bash
python manage.py runserver
```
The API will be available at: **`http://127.0.0.1:8000/`**

---

## 🛠 New Features & Media Highlights

### 1. Multiple Product Images
We transitioned from a single `image_url` field to a dedicated **`ProductImage`** model. This allows each product to have an unlimited number of high-resolution images.

### 2. Automatic Thumbnail Generation
Every time an image is uploaded (via Postman or the Admin panel), the backend automatically:
- Opens the original high-resolution file using **Pillow**.
- Resizes it to a **200x200 pixel** thumbnail.
- Saves the thumbnail to a separate `media/products/thumbnails/` directory.
- Updates the database with the thumbnail's URL.

### 3. Image Validation & Security
To ensure performance and reliability, we implemented custom validators:
- **Max File Size**: Limits uploads to **5MB** to prevent server overloads.
- **File Type**: Ensures only valid images (JPEG, PNG, WEBP) are accepted.

---

## 🔐 Authentication & Security

This API uses **Token-Based Authentication**.

### How to Authenticate:
1. **Register** a new user at `/api/register/`.
2. **Login** at `/api/login/` to receive your unique **Authentication Token**.
3. **Include the Token** in the header of your protected requests:
   - **Header Key**: `Authorization`
   - **Header Value**: `Token <your_token_key>`

---

## 📑 API Endpoints Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/register/` | POST | Register a new user | No |
| `/api/login/` | POST | Login and get Token | No |
| `/api/products/` | GET | List all products (with Images & Thumbnails) | No |
| `/api/product-images/` | POST | **Upload 1 or more images** for a product | **Yes** |
| `/api/categories/` | GET | List all categories with product counts | No |
| `/api/carts/` | GET | View your personal cart | **Yes** |

---

## 🧪 Testing with Postman

### How to Upload Images in Postman:
1. Set the Method to **`POST`** and URL to `http://127.0.0.1:8000/api/product-images/`.
2. Go to the **Body** tab and select **form-data**.
3. Add a key called **`product`** with the ID of your product.
4. Add a key called **`image`**, change its type to **File**, and select your images.
   - *Note: Our API supports selecting multiple files into the `image` field simultaneously!*

---

## 🏗 Project Structure (Media Storage)
- **`media/products/`**: Stores original high-resolution uploads.
- **`media/products/thumbnails/`**: Stores auto-generated optimized thumbnails.

---

## 👤 Author
**Rohit Mohan**  
*Week 10 - Internship to Hire Excellence Program (I2HEP)*
