-- Schema for books_app

DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  isbn VARCHAR(255),
  description TEXT,
  bookshelf VARCHAR(255),
  image_url VARCHAR(255)
);

INSERT INTO books (author, title, isbn, description, bookshelf, image_url)
VALUES ('brandyn', 'book', 1234567891011,'i am the discription', 'fiction', 'https://i.imgur.com/J5LVHEL.jpg');
