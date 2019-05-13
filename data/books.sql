-- Schema for books_app

DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(10000),
  author VARCHAR(10000),
  isbn VARCHAR(10000),
  description TEXT,
  bookshelf VARCHAR(10000),
  image_url VARCHAR(10000)
);

INSERT INTO books (author, title, isbn, description, bookshelf, image_url)
VALUES ('brandyn', 'book', 1234567891011,'i am the discription', 'fiction', 'https://i.imgur.com/J5LVHEL.jpg');
