CREATE DATABASE IF NOT EXISTS mm_secondary_school;
USE mm_secondary_school;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. ADM001, PUP1002, TCH501
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'pupil', 'parent') NOT NULL,
    dob DATE NULL,
    gender VARCHAR(10) NULL,
    level VARCHAR(20) NULL,      -- 'form' or 'grade'
    form_grade VARCHAR(20) NULL, -- e.g. 'Form 1', 'Grade 11'
    class_name VARCHAR(50) NULL, -- e.g. 'A', 'B'
    parent_phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type ENUM('assignment', 'test', 'exam') NOT NULL,
    class_target VARCHAR(50) NOT NULL, -- e.g. 'Form 1-A', 'Grade 12-B'
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    pupil_id INT NOT NULL,
    submission_text TEXT NOT NULL,
    grade VARCHAR(5) DEFAULT NULL,
    marked_at TIMESTAMP NULL DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (pupil_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_role ENUM('admin', 'teacher', 'pupil', 'parent') NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Keyboard Board Messages (Replaces drawing canvas coordinates)
CREATE TABLE IF NOT EXISTS board_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    content VARCHAR(255) NOT NULL,
    color_theme VARCHAR(30) DEFAULT 'var(--sky)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed primary administrator account if missing (Password: admin123)
INSERT INTO users (user_id_code, first_name, last_name, email, phone, password, role)
VALUES ('ADM001', 'Principal', 'Admin', 'admin@mmss.edu', '0977000001', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE user_id_code=user_id_code;