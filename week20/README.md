# 🚀 Week 19: File Upload from Frontend

## 📌 Project Overview

Welcome to **Week 19: File Upload from Frontend**! This week, we extended our full-stack e-commerce platform by building a **premium React Admin Dashboard** supporting **complete product CRUD operations** with **FormData handling**, **image preview before upload**, and a **real-time upload progress bar**.

---

## 🎯 Deliverables

### ✅ Topics Covered

| Topic | Implementation |
|---|---|
| **FormData Handling** | `ProductForm.jsx` sends product image files via `FormData` to `/api/product-images/` |
| **Progress Bar for Uploads** | Axios `onUploadProgress` callback drives a real-time animated progress bar in the UI |

---

### ✅ Requirements Met

| Requirement | Status | Details |
|---|---|---|
| **Product Add Form** | ✅ Done | `/admin` → "Add Product" with full validation |
| **Product Edit Form** | ✅ Done | Edit button on table row loads form pre-populated with product data |
| **Product Delete** | ✅ Done | Delete button with confirmation dialog |
| **Image Upload with Progress Bar** | ✅ Done | Animated fill bar with percentage label during upload |
| **Image Preview Before Upload** | ✅ Done | `URL.createObjectURL()` renders live thumbnails of chosen files before submit |

---

## 🛠 Features

### 1. Admin Control Panel (`/admin`)
- Protected behind `<ProtectedRoute>` (JWT auth required)
- Linked in the header navigation for authenticated users via a **Shield** icon
- Shows **3 stats cards**: Total Products, Low Stock Count, Category Count
- Full searchable paginated **product table** with thumbnail, name, category, price, stock

### 2. Product Form (`ProductForm.jsx`)
- Fields: Product Name, Category (dropdown), Price (INR), Stock Quantity, Description
- **Image Preview**: Selected files are immediately previewed as thumbnails using `URL.createObjectURL()`; previews cleaned up with `URL.revokeObjectURL()` on unmount
- **File selector**: Click-to-browse zone with drag-and-drop UX; supports multiple images
- Existing images shown in **edit mode** with per-image delete capability
- **Real-time upload progress bar** driven by Axios `onUploadProgress`

### 3. Backend Robustness
- **Slug collision handling**: Product `save()` now auto-appends a counter (`-1`, `-2`, ...) when a slug already exists
- **FormData fix**: Axios interceptor auto-removes `Content-Type` for `FormData` requests so browser sets correct multipart boundary
- `ProductImageViewSet` always explicitly passes `product_id` for both single and multiple image uploads

---

## 📑 Tech Stack

- **Backend**: Django REST Framework + SimpleJWT
- **Frontend**: React 19 + Vite
- **HTTP Client**: Axios (with request interceptor for multipart uploads)
- **Routing**: React Router v6 + ProtectedRoute
- **Styling**: Vanilla CSS design system
- **Icons**: Lucide React

---

## 💻 Setup & Running

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then visit: **http://localhost:5173**

Log in with `admin / admin123` and click **Admin** in the navigation.

---

## 👤 Author
**Rohit Mohan**  
*Week 19 - Internship to Hire Excellence Program (I2HEP)*
