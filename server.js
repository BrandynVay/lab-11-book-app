'use strict';

// PROVIDE ACCESS TO ENVIRONMENT VARIABLES IN .env
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes

// Renders the search form
app.get('/', showBooks);
app.get('/book-details/:book_id', showBookDetails);
app.get('/new-book-search', newSearch);
app.post('/searches', createSearch);
app.post('/add-to-database', addBooks);
app.put('/update-book/:book_id', updateBook);
app.delete('/delete-book/:book_id', deleteBook);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// TURN THE SERVER ON
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));


// HELPER FUNCTIONS

// Shows the selected book's details
function showBookDetails(request, response) {
  getBookshelves()
    .then(bookshelves => {
      const SQL = 'SELECT * FROM books WHERE id=$1;';
      const values = [request.params.book_id];
      return client.query(SQL, values)
        .then(result => response.render('pages/books/show', { bookDetails: result.rows[0], shelfList: bookshelves.rows }))
    })
    .catch(handleError);
}

function getBookshelves() {
  const SQL = 'SELECT DISTINCT bookshelf FROM books;';
  return client.query(SQL);
}

// Retrieves books from database
function showBooks(request, response) {
  const sql = `SELECT * FROM books`;
  
  return client.query(sql)
  .then(booksFromDatabase => {
    response.render('pages/index', {
      savedBooksFromDatabase: booksFromDatabase.rows,
      numberOfBooksSaved: booksFromDatabase.rowCount
    })
  })
  .catch(err => handleError(err, response));
}

function newSearch(request, response) {
  response.render('pages/searches/new');
}

// Console.log request.body and request.body.search
function createSearch(request, response) {
  
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  
  console.log(url);
  
  superagent.get(url)
  .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
  .then(results => response.render('pages/searches/show', { searchResults: results }))
  .catch(err => handleError(err, response));
}

function addBooks(request, response) {
  let { title, author, isbn, description, bookshelf, image_url} = request.body;

  // console.log()
  
  const SQL = 'INSERT INTO books (title, author, isbn, description, bookshelf, image_url) VALUES ($1, $2, $3, $4, $5, $6);';
  const values = [title, author, isbn, description, bookshelf, image_url];
  
  return client.query(SQL, values)
  .then(() => {
    const SQL = 'SELECT id FROM books WHERE isbn=$1;'
    const values = [request.body.isbn];
    return client.query(SQL, values)
    .then(result => {
      response.redirect(`/book-details/${result.rows[0].id}`)
    })
    .catch(err => handleError(err, response));
  })
  .catch(err => handleError(err, response));
}

// Updates books
function updateBook(request, response) {
  let { title, author, isbn, description, bookshelf, image_url } = request.body;
  const SQL = 'UPDATE books SET title=$1, author=$2, isbn=$3, description=$5, bookshelf=$6, image_url=$4, WHERE id=$7;';
  const values = [title, author, isbn, description, bookshelf, image_url, request.params.book_id];
  client.query(SQL, values)
    .then(response.redirect(`/book-details/${request.params.book_id}`))
    .catch(error => handleError(error, response));
}

// Deletes book from DB
function deleteBook(request, response) {
  const SQL = 'DELETE FROM books WHERE id=$1;';
  const value = [request.params.book_id];
  client.query(SQL, value)
    .then(response.redirect('/'))
    .catch(error => handleError(error, response));
}

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'Title not available';
  this.author = info.authors ? info.authors[0] : 'Author not available';
  this.isbn = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : 'ISBN not available';
  this.description = info.description ? info.description : 'No description';
  this.bookshelf = info.categories ? info.categories[0] : 'Uncategorized';
  this.image_url = info.imageLinks ? info.imageLinks.thumbnail : placeholderImage;
  const letsEncrypt = (url) => {
    let http = 'http';
    return url.replace(http, 'https')
  }
  this.image_url = letsEncrypt(this.image_url);
}

// ERROR HANDLER
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

client.on('err', err => console.error(err));
