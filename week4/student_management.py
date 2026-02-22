import mysql.connector
import csv
import os
from dotenv import load_dotenv
from mysql.connector import Error


load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def connect_db():
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        print("Connected to database successfully!")
        return connection
    except Error as e:
        print("Database connection failed:", e)
        return None

def add_student(connection):
    try:
        cursor = connection.cursor()
        name = input("Enter Name: ")
        age = int(input("Enter Age: "))
        grade = input("Enter Grade: ")
        email = input("Enter Email: ")

        query = """
        INSERT INTO students (name, age, grade, email)
        VALUES (%s, %s, %s, %s)
        """

        cursor.execute(query, (name, age, grade, email))
        connection.commit()

        print("Student added")

    except Exception as e:
        print("Error:", e)

def view_students(connection):
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM students")
    rows = cursor.fetchall()

    if not rows:
        print("No student records found.")
        return

    print("\n" + "="*80)
    print("{:<5} {:<15} {:<5} {:<10} {:<25} {:<20}".format(
        "ID", "Name", "Age", "Grade", "Email", "Created At"
    ))
    print("="*80)

    for row in rows:
        print("{:<5} {:<15} {:<5} {:<10} {:<25} {:<20}".format(
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            row[5].strftime("%Y-%m-%d %H:%M")
        ))

    print("="*80)
def update_student(connection):
    try:
        cursor = connection.cursor()
        student_id = int(input("Enter Student ID to update: "))
        new_grade = input("Enter New Grade: ")

        query = "UPDATE students SET grade=%s WHERE id=%s"
        cursor.execute(query, (new_grade, student_id))
        connection.commit()

        print("Record updated")

    except Exception as e:
        print("Error:", e)

def delete_student(connection):
    try:
        cursor = connection.cursor()
        student_id = int(input("Enter Student ID to delete: "))

        query = "DELETE FROM students WHERE id=%s"
        cursor.execute(query, (student_id,))
        connection.commit()

        if cursor.rowcount == 0:
            print("No record found with that ID.")
        else:
            print("Record deleted successfully!")

    except Exception as e:
        print("Error:", e)

def search_student(connection):
    cursor = connection.cursor()

    print("\nSearch By:")
    print("1. ID")
    print("2. Name")
    print("3. Grade")

    choice = input("Enter choice: ")

    if choice == "1":
        student_id = int(input("Enter ID: "))
        cursor.execute("SELECT * FROM students WHERE id=%s", (student_id,))
    elif choice == "2":
        name = input("Enter Name: ")
        cursor.execute("SELECT * FROM students WHERE name LIKE %s", ('%' + name + '%',))
    elif choice == "3":
        grade = input("Enter Grade: ")
        cursor.execute("SELECT * FROM students WHERE grade=%s", (grade,))
    else:
        print("Invalid choice.")
        return

    results = cursor.fetchall()

    if not results:
        print("⚠ No matching records found.")
        return

    print("\n" + "="*80)
    print("{:<5} {:<15} {:<5} {:<10} {:<25} {:<20}".format(
        "ID", "Name", "Age", "Grade", "Email", "Created At"
    ))
    print("="*80)

    for row in results:
        print("{:<5} {:<15} {:<5} {:<10} {:<25} {:<20}".format(
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            row[5].strftime("%Y-%m-%d %H:%M")
        ))

    print("="*80)


def export_to_csv(connection):
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM students")
    rows = cursor.fetchall()

    with open("student_data.csv", "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["ID", "Name", "Age", "Grade", "Email", "Created_At"])
        writer.writerows(rows)

    print("Data exported to student_data.csv successfully")

def main():
    connection = connect_db()

    if connection is None:
        return

    while True:
        print("\n===== Student Record Management =====")
        print("1. Add Student")
        print("2. View Students")
        print("3. Update Student")
        print("4. Delete Student")
        print("5. Search Student")
        print("6. Export to CSV")
        print("7. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_student(connection)
        elif choice == "2":
            view_students(connection)
        elif choice == "3":
            update_student(connection)
        elif choice == "4":
            delete_student(connection)
        elif choice == "5":
            search_student(connection)
        elif choice == "6":
            export_to_csv(connection)
        elif choice == "7":
            print("Exiting...")
            break
        else:
            print("Invalid choice")

    connection.close()


if __name__ == "__main__":
    main()