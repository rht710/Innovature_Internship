# Week 8 – Authentication, Account Lockout & Role-Based Middleware

## Overview
This week extends the **User Notes REST API** by significantly upgrading the authentication and security systems. 
We implemented **Two-Factor Authentication (Email OTP)**, a strict **Account Lockout Mechanism**, and a custom **Role-Based Access Middleware** to protect administrative routes.

---

## Features Implemented

### 1. Two-Factor Authentication (Email OTP)
- The standard JWT login was upgraded into a two-step process.
- Submitting valid credentials to `/login/` generates a secure 6-digit OTP code which is sent to the user's registered email address using Django's SMTP backend.
- The OTP is verified at the `/verify-otp/` endpoint. If valid and submitted within a 5-minute expiration window, the user receives their JWT `access` and `refresh` tokens.

### 2. Account Lockout Mechanism (Upgraded)
- **Temporary Lockout**: If a user submits an incorrect password OR an incorrect OTP **5 times**, their account is temporarily locked for **5 minutes**.
- **Permanent Lockout**: Accounts can also be flagged as `is_locked = True` for permanent administrative suspension.
- **Dynamic Feedback**: Any subsequent login or OTP attempts during the lockout period are rejected with a `403 Forbidden` response that includes a countdown of the remaining lockout time (e.g., "Try again in 4m 30s").

### 3. Role-Based Access Middleware
- A custom `RoleBasedAccessMiddleware` was built to protect sensitive API routes without polluting the views.
- The middleware intercepts any request to paths starting with `/demo-admin/`.
- It dynamically extracts the JWT `access` token from the `Authorization` header, identifies the user, and verifies that the user's profile role is set to `admin`. Normal users receive an immediate `403 Forbidden: You do not have permission to access admin features.`

---

## Postman Testing Instructions

1. **Trigger OTP & Lockout (`POST /login/`)**
   - Provide `username` and `password`.
   - Sends the OTP to the user's Gmail (or provides it as a fallback in local dev if SMTP is blocked).
   - Intentionally failing 5 times triggers the lockout protection.

2. **Verify OTP (`POST /verify-otp/`)**
   - Provide `username` and `otp`.
   - Exchanges the valid OTP for the JWT `access` token.

3. **Verify Role Security (`GET /demo-admin/`)**
   - Add the `Authorization: Bearer <token>` header.
   - Successful for `admin` users (200 OK).
   - Blocked for `user` users (403 Forbidden).

---

# Week 7 – Routing & Serializers (Public Note Sharing)

## Overview

This week extends the **User Notes REST API** by adding a feature that allows users to **share notes publicly using unique URLs**.
Using **Django REST Framework serializers and routing**, the system generates a unique shareable link for a note, optionally sets an expiration date, and tracks how many times the shared link is accessed.

This feature demonstrates the use of:

* URL routing in Django
* Request and response handling
* Django REST Framework serializers
* Public API endpoints

---

## Features Implemented

### 1. Unique Shareable Link

A unique **UUID-based link** is generated for each shared note.
This link allows anyone to access the note without authentication.

Example format:

```
/api/share/<share_id>/
```

Example:

```
http://127.0.0.1:8000/api/share/4c3d9c24-b4d4-4a7a-bc99-123456789abc/
```

---

### 2. Optional Expiration Date

When creating a share link, users can optionally specify an **expiration date**.
After this date, the link becomes invalid and the API returns an error.

Example request body:

```json
{
  "expires_at": "2026-03-20T12:00:00"
}
```

If the link has expired, the API returns:

```json
{
  "error": "Link expired"
}
```

---

### 3. Access Count Tracking

Every time a shared note link is opened, the system increments the **access count**.
This helps track how many times the shared note has been viewed.

Example response:

```json
{
  "title": "Meeting Notes",
  "content": "Discuss project timeline",
  "access_count": 3
}
```

---

## Database Model

A new model **SharedNote** was added to store shared link information.

Fields:

| Field        | Description                                |
| ------------ | ------------------------------------------ |
| note         | Reference to the original note             |
| share_id     | Unique UUID used in the public link        |
| expires_at   | Optional expiration date                   |
| access_count | Number of times the link has been accessed |
| created_at   | Timestamp of link creation                 |

---

## API Endpoints

### 1. Generate Share Link

Creates a shareable link for a specific note.

**Endpoint**

```
POST /api/share/create/{note_id}/
```

**Headers**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (optional)**

```json
{
  "expires_at": "2026-03-20T12:00:00"
}
```

**Response Example**

```json
{
  "id": 1,
  "note": 1,
  "share_id": "7f2a8c3d-8e7b-4f23-bf20-abc123",
  "expires_at": "2026-03-20T12:00:00",
  "access_count": 0
}
```

---

### 2. Access Shared Note (Public)

Retrieves the content of a shared note using the generated share link.

**Endpoint**

```
GET /api/share/{share_id}/
```

**Authentication**

Not required (public access).

**Response Example**

```json
{
  "title": "Test Note",
  "content": "Testing share feature",
  "access_count": 1
}
```

---

## Postman Testing

The following API requests were tested using **Postman**:

1. **JWT Login**
2. **Create Note**
3. **Generate Share Link**
4. **Access Shared Note**
5. **Access Count Increment**
6. **Expired Link Test**

Screenshots of these tests are included as part of the submission.

---

## How to Run the Project

### Prerequisites: Email Setup (Week 8)
To cleanly test the OTP email generation locally, you must provide a valid Gmail address and App Password before running the server:
1. Open up `notes_project/settings.py` in your editor.
2. Scroll to the bottom and locate the `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` variables.
3. Replace the placeholder values with your Gmail address and a generated 16-character Google App Password.

---

1. Clone the repository

```
git clone https://github.com/Innovatureai/INV_INT_13_Rohit-Mohan.git
```

2. Navigate to the project directory

```
cd project_folder
```

3. Install dependencies

```
pip install -r requirements.txt
```

4. Apply migrations

```
python manage.py makemigrations
python manage.py migrate
```

5. Run the server

```
python manage.py runserver
```

Server will start at:

```
http://127.0.0.1:8000/
```

---

## Technologies Used

* Python
* Django
* Django REST Framework
* JWT Authentication
* Postman (API testing)

---

## Conclusion

The Week 7 implementation successfully introduces **public note sharing** using unique links, optional expiration control, and access tracking.
This enhances the functionality of the Notes API by enabling controlled public access while maintaining proper API structure using Django REST Framework serializers and routing.
