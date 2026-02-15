# 📚 Library Management System (CLI)

## 📌 Project Overview

This is a Command-Line Interface (CLI) based Library Management System developed using Python.  
The system allows management of books, members, and transactions while storing all records in CSV files.

This project demonstrates Python basics, Object-Oriented Programming (OOP), file handling, and exception handling.

---

## 🛠 Technologies Used

- Python
- CSV File Handling
- OOP (Classes and Objects)
- Date & Time Module
- Exception Handling

---

## 📂 Project Structure

week3/
│
├── library_system.py  
├── books.csv  
├── members.csv  
├── transactions.csv  
└── README.md  

---

## 🚀 How to Run the Program

1. Open terminal in the project folder.
2. Run:

python library_system.py

3. Use the menu options displayed.

---

## 📋 Features

### 1️⃣ Add Book
- Enter title, author, genre, and number of copies.
- Automatically generates a unique Book ID.
- Stores data in books.csv.

### 2️⃣ Add Member
- Enter member name and email.
- Automatically generates a unique Member ID.
- Stores data in members.csv.

### 3️⃣ View Books
- Displays all books with:
  - ID
  - Title
  - Author
  - Genre
  - Available Copies

### 4️⃣ Borrow Book
- Validates member existence.
- Validates book existence.
- Prevents borrowing if no copies available.
- Prevents duplicate borrowing by same member.
- Automatically sets due date (7 days from borrow date).
- Updates books.csv and transactions.csv.

### 5️⃣ Return Book
- Validates active borrowing.
- Calculates late fee if returned after due date.
- Updates available copies.
- Stores return date and fee in transactions.csv.

### 6️⃣ Remove Book
- Prevents removal if book is currently borrowed.
- Maintains data consistency.

---

## 📅 Late Fee Policy

Borrow Duration: 7 days  
Late Fee: ₹5 per day  

Late Fee Formula:

Late Fee = Number of Days Late × 5

---

## 📊 Data Storage Format

books.csv  
id,title,author,genre,copies  

members.csv  
id,name,email  

transactions.csv  
id,book_id,member_id,borrow_date,due_date,return_date,fee  

---

## 🧠 Key Concepts Demonstrated

- Classes and Objects
- Encapsulation
- File I/O (CSV read/write)
- Exception Handling
- Data Validation
- Unique ID generation using max(existing_id) + 1
- Maintaining referential integrity

---

## 🎓 Academic Context

Developed as part of:

Week 3 – Python Basics, OOP & File Handling

---

## 👤 Author

Rohit Mohan  
Internship to Hire Excellence Program (I2HEP)

---

## ⚠ Important Notes

- Do not keep CSV files open while running the program.
- IDs are not rearranged after deletion to maintain referential integrity.
- Data persists between runs using CSV storage.
