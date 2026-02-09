# Week 2 – Feedback Form (MySQL)

Simple feedback form that stores submissions in **MySQL**, validates and sanitizes input, and shows a **paginated** feedback list.

## What it does

- Feedback form: **Name**, **Email**, **Message**
- Stores entries in **MySQL** (`feedback_db.feedback` table)
- Dedicated feedback page with **pagination**
- Protection against **SQL injection** (parameterized queries) and **XSS** (HTML escaping)

## Quick setup

### 1. MySQL

Create the database and table (any MySQL client or terminal):

```sql
CREATE DATABASE IF NOT EXISTS feedback_db;
USE feedback_db;

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Environment file

From the project root:

```bash
copy .env.example .env
```

Edit `.env` and set your MySQL details:

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=feedback_db
PORT=3000
```

### 3. Install & run

```bash
npm install
npm start
```

Then open:

- Form: `http://localhost:3000`
- Feedback list (with pagination): `http://localhost:3000/feedback`

## How to quickly test

1. Submit a few feedbacks on the **form page** (all fields required).
2. Go to the **feedback page** – you should see:
   - Your entries, newest first
   - Pagination when there are more than 10 items
3. Try leaving fields empty or using an invalid email to see validation errors.

## Files to know

- `db/schema.sql` – MySQL schema (database + table)
- `db/connection.js` – MySQL connection pool
- `routes/feedback.js` – POST submit, GET list (validation, sanitization, pagination)
- `public/index.html` – Feedback form UI
- `public/feedback.html` – Feedback list UI with pagination
- `server.js` – Express server wiring everything together

# Week 2 – Feedback Form (MySQL)

Feedback form that stores submissions in **MySQL**, with validation, sanitization (XSS/SQL injection prevention), and a feedback list page with **pagination**.

## Requirements covered

- Feedback form: **Name**, **Email**, **Message**
- Store entries in **MySQL** (local DB)
- Display feedback on a **dedicated page** with **pagination**
- **Input validation** (required fields, email format, length limits)
- **Sanitization**: parameterized queries (SQL injection), HTML escaping (XSS)

## Tech stack

- **Backend:** Node.js, Express
- **Database:** MySQL (mysql2)
- **Validation:** express-validator
- **Frontend:** HTML, CSS, vanilla JS

## Setup

### 1. MySQL

Create the database and table (run in MySQL client or MySQL Workbench):

```bash
mysql -u root -p < db/schema.sql
```

Or run the contents of `db/schema.sql` manually:

```sql
CREATE DATABASE IF NOT EXISTS feedback_db;
USE feedback_db;

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Environment

Copy the example env file and set your MySQL credentials:

```bash
copy .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=feedback_db
PORT=3000
```

### 3. Install and run

```bash
npm install
npm start
```

Open:

- **Form:** http://localhost:3000  
- **Feedback list (with pagination):** http://localhost:3000/feedback  

## How to test

### One-time setup

1. **MySQL:** Create the database and table (see Setup above). Ensure MySQL is running.
2. **Env:** Copy `.env.example` to `.env` and set `DB_PASSWORD` (and `DB_USER` if different).
3. **Install:** From the project folder run:
   ```bash
   npm install
   npm start
   ```
   You should see: `Server running at http://localhost:3000`

### 1. Test form submission

1. Open **http://localhost:3000**
2. Fill in **Name**, **Email**, **Message** and click **Submit Feedback**
3. You should see: *"Thank you! Your feedback has been submitted."* and the form should clear
4. Submit 2–3 more entries with different data (useful for pagination later)

### 2. Test feedback list and pagination

1. Click **"View all feedback →"** or open **http://localhost:3000/feedback**
2. Your submitted entries should appear (newest first)
3. If you have more than 10 entries, use **Previous** / **Next** or page numbers to switch pages

### 3. Test validation

On the form page (http://localhost:3000):

- Submit with **Name** empty → error under Name
- Submit with **Email** empty or invalid (e.g. `abc`) → error under Email
- Submit with **Message** empty → error under Message  
Correct the fields and submit again; it should succeed.

### 4. (Optional) Test XSS sanitization

1. Submit feedback with a message like: `<script>alert('xss')</script>` or `<b>Hello</b>`
2. Open the feedback list — the text should appear as plain text (e.g. `<script>...`), not run or render as HTML
3. This confirms stored data is escaped when displayed

### Screenshots for deliverables

- **Screenshot 1:** Form page after a successful submit (with the green success message visible)
- **Screenshot 2:** Feedback list page showing at least one entry and pagination (if you have multiple pages)

## Security (validation & sanitization)

| Risk | Mitigation |
|------|------------|
| **SQL injection** | All queries use **parameterized statements** (`?` placeholders), never string concatenation. |
| **XSS** | Server validates input; **HTML escape** on stored data before sending to client; list page renders text only (no raw user HTML). |
| **Validation** | `express-validator`: required fields, email format, max length (name 100, email 255, message 5000). |

## Deliverables

1. **Source code:** Push this project to GitHub (repo + link in submission).
2. **Screenshots:** Form page with a submitted feedback; feedback list page showing entries and pagination.

## Project structure

```
week2/
├── db/
│   ├── schema.sql      # MySQL schema
│   └── connection.js  # DB pool
├── public/
│   ├── index.html     # Feedback form
│   └── feedback.html  # Feedback list + pagination
├── routes/
│   └── feedback.js    # POST submit, GET list (validation & sanitization)
├── server.js
├── package.json
├── .env.example
└── README.md
```
