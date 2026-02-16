import csv
import os
from datetime import datetime, timedelta

BOOKS_FILE = "books.csv"
MEMBERS_FILE = "members.csv"
TRANSACTIONS_FILE = "transactions.csv"
DATE_FORMAT = "%Y-%m-%d"
LATE_FEE_PER_DAY = 5


class Book:
    def __init__(self, book_id, title, author, genre, copies):
        self.book_id = book_id
        self.title = title
        self.author = author
        self.genre = genre
        self.copies = int(copies)

    def to_list(self):
        return [self.book_id, self.title, self.author, self.genre, self.copies]


class Member:
    def __init__(self, member_id, name, email):
        self.member_id = member_id
        self.name = name
        self.email = email

    def to_list(self):
        return [self.member_id, self.name, self.email]


class Transaction:
    def __init__(self, trans_id, book_id, member_id, borrow_date, due_date, return_date="", fee=0):
        self.trans_id = trans_id
        self.book_id = book_id
        self.member_id = member_id
        self.borrow_date = borrow_date
        self.due_date = due_date
        self.return_date = return_date
        self.fee = float(fee)

    def calculate_fee(self):
        if self.return_date == "":
            return 0

        due = datetime.strptime(self.due_date, DATE_FORMAT)
        returned = datetime.strptime(self.return_date, DATE_FORMAT)
        days_late = (returned - due).days

        if days_late > 0:
            return days_late * LATE_FEE_PER_DAY
        return 0


def load_csv(filename):
    data = []
    if not os.path.exists(filename):
        return data

    with open(filename, "r", newline="") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            data.append(row)
    return data


def save_csv(filename, header, rows):
    with open(filename, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


def add_book():
    books = load_csv(BOOKS_FILE)

    title = input("Enter title: ")
    author = input("Enter author: ")
    genre = input("Enter genre: ")

    try:
        copies = int(input("Enter number of copies: "))
    except ValueError:
        print("Invalid number.")
        return

    if books:
        max_id = max(int(book[0]) for book in books)
        book_id = str(max_id + 1)
    else:
        book_id = "1"

    book = Book(book_id, title, author, genre, copies)
    books.append(book.to_list())

    save_csv(BOOKS_FILE, ["id", "title", "author", "genre", "copies"], books)
    print("Book added successfully!")


def add_member():
    members = load_csv(MEMBERS_FILE)

    name = input("Enter member name: ")
    email = input("Enter member email: ")

    if members:
        max_id = max(int(member[0]) for member in members)
        member_id = str(max_id + 1)
    else:
        member_id = "1"

    member = Member(member_id, name, email)
    members.append(member.to_list())

    save_csv(MEMBERS_FILE, ["id", "name", "email"], members)

    print("\nMember added successfully!")
    print("Member ID:", member_id)
    print("Name:", name)


def view_books():
    books = load_csv(BOOKS_FILE)

    if not books:
        print("No books available.")
        return

    print("\nAvailable Books:")
    print("ID | Title | Author | Genre | Copies")

    for book in books:
        print(f"{book[0]} | {book[1]} | {book[2]} | {book[3]} | {book[4]}")


def borrow_book():
    books = load_csv(BOOKS_FILE)
    members = load_csv(MEMBERS_FILE)
    transactions = load_csv(TRANSACTIONS_FILE)

    member_id = input("Enter member ID: ")
    book_id = input("Enter book ID: ")

    member_exists = any(m[0] == member_id for m in members)
    if not member_exists:
        print("Member not found.")
        return

    book_found = False
    for book in books:
        if book[0] == book_id:
            book_found = True
            if int(book[4]) <= 0:
                print("Book not available.")
                return
            break

    if not book_found:
        print("Book not found.")
        return

    for t in transactions:
        if t[1] == book_id and t[2] == member_id and t[5] == "":
            print("This member already borrowed this book.")
            return

    borrow_date = datetime.now().strftime(DATE_FORMAT)
    due_date = (datetime.now() + timedelta(days=7)).strftime(DATE_FORMAT)

    if transactions:
        max_id = max(int(t[0]) for t in transactions)
        trans_id = str(max_id + 1)
    else:
        trans_id = "1"

    transactions.append([
        trans_id,
        book_id,
        member_id,
        borrow_date,
        due_date,
        "",
        0
    ])

    for book in books:
        if book[0] == book_id:
            book[4] = str(int(book[4]) - 1)

    save_csv(BOOKS_FILE, ["id", "title", "author", "genre", "copies"], books)
    save_csv(
        TRANSACTIONS_FILE,
        ["id", "book_id", "member_id", "borrow_date", "due_date", "return_date", "fee"],
        transactions
    )

    print("Book borrowed successfully!")
    print("Due date:", due_date)


def return_book():
    books = load_csv(BOOKS_FILE)
    transactions = load_csv(TRANSACTIONS_FILE)

    member_id = input("Enter member ID: ")
    book_id = input("Enter book ID: ")

    for t in transactions:
        if t[1] == book_id and t[2] == member_id and t[5] == "":
            return_date = datetime.now().strftime(DATE_FORMAT)
            t[5] = return_date

            transaction = Transaction(t[0], t[1], t[2], t[3], t[4], t[5])
            fee = transaction.calculate_fee()
            t[6] = str(fee)

            for book in books:
                if book[0] == book_id:
                    book[4] = str(int(book[4]) + 1)

            save_csv(BOOKS_FILE, ["id", "title", "author", "genre", "copies"], books)
            save_csv(
                TRANSACTIONS_FILE,
                ["id", "book_id", "member_id", "borrow_date", "due_date", "return_date", "fee"],
                transactions
            )

            print("\nBook returned successfully!")
            print("Late fee:", fee)
            return

    print("\nNo active borrowing found for this Member and Book.")


def remove_book():
    books = load_csv(BOOKS_FILE)
    transactions = load_csv(TRANSACTIONS_FILE)

    book_id = input("Enter Book ID to remove: ")

    book_exists = any(book[0] == book_id for book in books)
    if not book_exists:
        print("Book not found.")
        return

    for t in transactions:
        if t[1] == book_id and t[5] == "":
            print("Cannot remove book. It is currently borrowed.")
            return

    books = [book for book in books if book[0] != book_id]

    save_csv(BOOKS_FILE, ["id", "title", "author", "genre", "copies"], books)
    print("Book removed successfully.")


def main():
    while True:
        print("\n===== Library Menu =====")
        print("1. Add Book")
        print("2. Add Member")
        print("3. View Books")
        print("4. Borrow Book")
        print("5. Return Book")
        print("6. Remove Book")
        print("7. Exit")

        choice = input("Enter choice: ")

        if choice == "1":
            add_book()
        elif choice == "2":
            add_member()
        elif choice == "3":
            view_books()
        elif choice == "4":
            borrow_book()
        elif choice == "5":
            return_book()
        elif choice == "6":
            remove_book()
        elif choice == "7":
            print("Exiting program...")
            break
        else:
            print("Invalid choice.")


if __name__ == "__main__":
    main()
