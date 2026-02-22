create database student_db;

use student_db;

create table students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT,
    grade VARCHAR(10),
    email VARCHAR(100),
    created_at TIMESTAMP default current_timestamp
);