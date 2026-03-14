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

1. Clone the repository

```
git clone <repository_url>
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
