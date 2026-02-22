# Student Record Management System (CLI)

## 📌 Overview

This project is a Command Line Interface (CLI) based Student Record Management System developed using Python and MySQL.  
It demonstrates relational database concepts, SQL CRUD operations, and secure database connectivity using environment variables.

The application allows users to manage student records directly from the terminal.

---

## 🚀 Features

- Add new student records
- View all student records (formatted table output)
- Update student details
- Delete student records
- Search student by:
  - ID
  - Name
  - Grade
- Export student records to CSV file
- Secure database credentials using `.env` file

---

## 🛠 Technologies Used

- Python 3
- MySQL
- mysql-connector-python
- python-dotenv
- CSV module

---

## 🗄 Database Schema

```sql
CREATE DATABASE student_db;

USE student_db;

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT,
    grade VARCHAR(10),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Environment Variables (.env)

Create a `.env` file in the project directory:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=student_db
```

This improves security by avoiding hardcoded credentials.

---

## 📂 Project Structure

```
week4/
│
├── student_management.py
├── schema.sql
├── student_data.csv
├── .env
└── README.md
```

---

## ⚙ Installation & Setup

1. Install required packages:

```
pip install mysql-connector-python
pip install python-dotenv
```

2. Create the database using `schema.sql`.

3. Configure your `.env` file.

4. Run the program:

```
python student_management.py
```

---

## 📊 Sample Output

The system displays student records in a clean tabular format:

```
================================================================================
ID    Name            Age   Grade      Email                     Created At
================================================================================
1     Rohit           20    A          rht@gmail.com             2026-02-22 20:14
================================================================================
```

---

## 📁 CSV Export

When selecting the export option, the program generates:

```
student_data.csv
```

This file contains all student records with proper headers.

---

## 📚 Concepts Demonstrated

- Relational database design
- Primary Key implementation
- SQL CRUD operations
- Parameterized queries (Prevents SQL Injection)
- Python-MySQL connection
- Environment variable management
- File handling in Python (CSV export)

---

## 🎯 Conclusion

This project demonstrates how Python can interact with relational databases to perform structured data operations securely and efficiently. It follows best practices such as using environment variables and parameterized queries.

---

### Author
Student Record Management System - Week 4 Assignment