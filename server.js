'use strict';

const express = require('express');
require('ejs');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const { response } = require('express');
const dbClient = new pg.Client(process.env.DATABASE_URL);
const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get('/', renderIndex);

function renderIndex(request, response) {
    let sql = 'SELECT * FROM books;';
    dbClient.query(sql)
        .then(databaseSearchResults => {
            response.render('pages/index.ejs', { homeArray: databaseSearchResults.rows })
        }).catch(error => errorHandler(error, request, response))
}

app.get('/hello', (request, response) => {
    response.render('pages/index.ejs');
})

app.get('/searches/new', (request, response) => {
    response.render('pages/searches/new.ejs');
})

app.get('/searches/show', (request, response) => {
    response.render('pages/searches/show.ejs');
})

app.post('/searches', (request, response) => {
    let query = request.body.search[0]
    let titleorAuthor = request.body.search[1]
    // console.log(request.body);

    let url = `https://www.googleapis.com/books/v1/volumes?q=+in${titleorAuthor}:${query}`;

    superagent.get(url)
        .then(results => {
            let bookArray = results.body.items;
            // console.log(results.body.items[0].volumeInfo.bookshelf);
           
            let totalBookArray = bookArray.map(book => {
                return new Book(book.volumeInfo)
            });
            response.render('pages/searches/show.ejs', { searchResults: totalBookArray })
        }).catch(error => errorHandler(error, request, response))
})

function addToDatabase() {
    let {title, authors, image_url, description, isbn, bookshelf} = results.body
    let sqlAdd = `INSERT INTO books (title, authors, image_url, description, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID;`;
    let safeValues = [book.volumeInfo.title, book.volumeInfo.authors, book.volumeInfo.image_url, book.volumeInfo.description, book.volumeInfo.isbn, book.volumeInfo.bookshelf]
    dbClient.query(sqlAdd, safeValues)
        .then(store => {
            let id = store.rows[0].id;
            response.redirect(`/${id}`)
                
                
            })
}

function Book(obj) {
    this.title = obj.title || 'Title not available'
    this.authors = obj.authors || 'Author not available'
    this.image_url = obj.imageLinks.thumbnail ? obj.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = obj.description || 'Description not available'
    this.isbn = obj.industryIdentifiers[0].identifier;
    // this.bookshelf = obj.
}

function errorHandler(error, request, response) {
    response.status(500).send({ status: 500, responseText: 'That did not go as expected' });
}

app.get('*', (request, response) => {
    response.status(404).send('Sorry, that did not work');
})

dbClient.connect()
    .then(() => {
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})
    });