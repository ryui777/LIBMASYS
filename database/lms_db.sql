CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  img VARCHAR(300) DEFAULT 'images/default.jpg',
  UNIQUE KEY unique_book (title, author),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS borrowed_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  borrowed_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('Borrowed','Returned') DEFAULT 'Borrowed',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  UNIQUE KEY unique_fav (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@ptchub.com', '$2y$12$7um6t./MQ/IeCkWxemOveuS.u0DaG47P8.CI/Fbtpl8bti3xsc4nq', 'admin'),
('admin123', 'admin123@ptchub.local', '$2y$12$7um6t./MQ/IeCkWxemOveuS.u0DaG47P8.CI/Fbtpl8bti3xsc4nq', 'admin');

UPDATE users
SET password = '$2y$12$7um6t./MQ/IeCkWxemOveuS.u0DaG47P8.CI/Fbtpl8bti3xsc4nq', role = 'admin'
WHERE email = 'admin@ptchub.com';

UPDATE users
SET name = 'admin123', password = '$2y$12$7um6t./MQ/IeCkWxemOveuS.u0DaG47P8.CI/Fbtpl8bti3xsc4nq', role = 'admin'
WHERE email = 'admin123@ptchub.local';

INSERT INTO books (title, author, category, img)
SELECT 'Beginners HTML', 'Wendy Willard', 'Basic HTML', 'images/books/book1.jpg'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='Beginners HTML' AND author='Wendy Willard');

INSERT INTO books (title, author, category, img)
SELECT 'CSS Mastery', 'Andy Budd', 'Advanced CSS', 'images/books/book2.jpg'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='CSS Mastery' AND author='Andy Budd');

INSERT INTO books (title, author, category, img)
SELECT 'JavaScript For Beginners', 'Tim Simon', 'Programming', 'images/books/book3.jpg'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='JavaScript For Beginners' AND author='Tim Simon');

INSERT INTO books (title, author, category, img)
SELECT 'The Life, Works, and Writings of Jose Rizal', 'Eugene Raymond P. Crudo, Herald Ian C. Guiwa, Reidan M. Pawilien', 'History', 'images/books/book4.png'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='The Life, Works, and Writings of Jose Rizal' AND author='Eugene Raymond P. Crudo, Herald Ian C. Guiwa, Reidan M. Pawilien');

INSERT INTO books (title, author, category, img)
SELECT 'Income Taxation', 'Rex B. Banggawan, CPA, MBA', 'Accounting', 'images/books/book5.png'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='Income Taxation' AND author='Rex B. Banggawan, CPA, MBA');

INSERT INTO books (title, author, category, img)
SELECT 'Scientology: The Fundamentals of Thought', 'L. Ron Hubbard', 'Basic Book of the Theory & Practice of Scientology', 'images/books/book6.png'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='Scientology: The Fundamentals of Thought' AND author='L. Ron Hubbard');

INSERT INTO books (title, author, category, img)
SELECT 'Introduction to Application Development and Emerging Technologies', 'Jake R. Pomperada, MAED-IT, MIT', 'Information Technology Education', 'images/books/book7.png'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='Introduction to Application Development and Emerging Technologies' AND author='Jake R. Pomperada, MAED-IT, MIT');

INSERT INTO books (title, author, category, img)
SELECT 'Networking for Dummies', 'Doug Lowe', 'Computer Networking', 'images/books/book8.png'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='Networking for Dummies' AND author='Doug Lowe');

INSERT INTO books (title, author, category, img)
SELECT 'IT Application Tools in Business', 'Roloulyn Rodriguez MAATA, Ronina Caoili-Tayuan', 'Information Technology', 'images/books/book9.png'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='IT Application Tools in Business' AND author='Roloulyn Rodriguez MAATA, Ronina Caoili-Tayuan');

INSERT INTO books (title, author, category, img)
SELECT 'Information Management', 'Ramesh Singh', 'Information Science/Technology', 'images/books/book10.png'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='Information Management' AND author='Ramesh Singh');
