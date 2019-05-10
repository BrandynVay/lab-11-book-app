'use strict';

// PROVIDE ACCESS TO ENVIRONMENT VARIABLES IN .env
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT;

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes

// Renders the search form
app.get('/', newSearch);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// TURN THE SERVER ON
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// ERROR HANDLER
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

// HELPER FUNCTIONS
// Only show part of this to get students started

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/index');
}

// Console.log request.body and request.body.search
function createSearch(request, response) {
  console.log(request.body)

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  console.log(url);
  // response.send('OK');

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }))
    .catch(err => handleError(err, response));
}

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title || 'No title available';
  this.author = info.authors || 'Author not available';
  this.description = info.description || 'No description';
  this.image_url = info.imageLinks.thumbnail || placeholderImage;
  this.letsEncrypt = url => {
    let http = 'http:';
    return url.replace(http, 'https:')
  }

  console.log('\n', info);
}
