'use strict';

const express = require('express');
require('ejs');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const dbClient = new pg.Client(process.env.DATABASE_URL);
const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.get('/', renderHomePage);
app.put('/bookshelf', displayBookshelf);
app.get('/searches/new', searchForm);
app.post('/searches', getBooksFromAPI);
app.post('/books', addToDatabase);
app.get('/books/:id', bookRequest);
app.put('/update/:books_id', updateBooks);
app.delete( '/delete/:id', deleteBook);
app.get('*', (request, response) => {
    response.status(404).send('Sorry, that did not work');
})


function displayBookshelf (request,response) {
    const bookshelf = request.body.bookshelf;
    let sql = 'SELECT DISTINCT id, title, authors, image_url, description, isbn, bookshelf FROM books WHERE bookshelf=$1;';
    let safeValue = [bookshelf];
    dbClient.query(sql, safeValue)
        .then(databaseSearchResults => {
            response.render('pages/index.ejs', { homeArray: databaseSearchResults.rows })
        }).catch(error => errorHandler(error, request, response))
}

function renderHomePage(request, response) {
    let sql = 'SELECT DISTINCT id, title, authors, image_url, description, isbn, bookshelf FROM books;';
    dbClient.query(sql)
        .then(databaseSearchResults => {
            response.render('pages/index.ejs', { homeArray: databaseSearchResults.rows })
        }).catch(error => errorHandler(error, request, response))
}

app.get('/searches/show', (request, response) => {
    response.render('pages/searches/show.ejs');
})

function getBooksFromAPI(request, response) {
    let query = request.body.search[0]
    let titleorAuthor = request.body.search[1]
    let url = `https://www.googleapis.com/books/v1/volumes?q=+in${titleorAuthor}:${query}`;

    superagent.get(url)
        .then(results => {
            let bookArray = results.body.items;
            let totalBookArray = bookArray.map(book => {
                return new Book(book.volumeInfo);
            });
            response.render('pages/searches/show.ejs', { searchResults: totalBookArray })
        }).catch(error => errorHandler(error, request, response))
}

function searchForm(request, response) {
    response.render('pages/searches/new.ejs');
}

function deleteBook(request,response) {
    let deleteId = request.params.id;
    let sql = 'DELETE FROM books WHERE id = $1;';
    let safeValue = [deleteId];
    dbClient.query(sql, safeValue)
        .then(()=>
        response.status(200).redirect('/'))
        .catch(error => errorHandler(error, request, response));
}

function addToDatabase(request, response) {
    let sql = 'SELECT * FROM books WHERE isbn = $1;';
    let safeValue = [request.body.isbn];
    dbClient.query(sql,safeValue)
        .then(result => {
        if (!result.rowCount) {
    let { title, authors, image_url, description, isbn, bookshelf } = request.body;
    let sqlAdd = 'INSERT INTO books (title, authors, image_url, description, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;';
    let safeValues = [title, authors, image_url, description, isbn, bookshelf];
    dbClient.query(sqlAdd, safeValues)
        .then(store => {
            let id = store.rows[0].id;
            response.status(200).redirect(`/books/${id}`)
        }).catch(error => console.log(error))
        } else {
            response.status(200).redirect(`/books/${result.rows[0].id}`);
        }
    })
}


function bookRequest(request, response) {
    // let bookshelf = getBookShelfs();
    // console.log('bookshelf array', bookshelf);
    let id = request.params.id;
    let sql = 'SELECT * FROM books WHERE id=$1;';
    let safeValues = [id];
    dbClient.query(sql, safeValues)
        .then(display => {
            response.status(200).render('./pages/books/show.ejs', {homeArray: display.rows});
        }).catch(error => errorHandler(error, request, response))
}

// function bookRequest(request, response) {
//     let rows = getBookShelfs();
//     let display = getHomeArray(request);
//     response.status(200).render('./pages/books/show.ejs', { homeArray: display, bookshelfArray: rows});
// }

// function getBookShelfs () {
//   let bsSql = 'SELECT DISTINCT bookshelf FROM books;';
//   dbClient.query(bsSql)
//     .then(results => {
//       console.log('sql results', results.rows);
//       return results.rows;
//     }).catch(error => console.log(error));
// }
// function getHomeArray(request) {
//     let id = request.params.id;
//     let sql = 'SELECT * FROM books WHERE id=$1;';
//     let safeValues = [id];
//     dbClient.query(sql, safeValues)
//         .then(display => {
//           return display.rows;
//         }).catch(error => errorHandler(error, request, response));
// }




function updateBooks(request, response) {
    let { title, authors, description, image_url, isbn, bookshelf } = request.body;
    let sql = 'UPDATE books SET authors=$1, title=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;';
    let booksId = request.params.books_id;
    let safeValues = [authors, title, isbn, image_url, description, bookshelf, booksId];
    dbClient.query(sql, safeValues)
        .then(sqlResults => {
            console.log(sqlResults.rows)
            response.status(200).redirect(`/books/${booksId}`)
        }).catch(error => errorHandler(error, request, response))
}

function Book(obj) {
    this.title = obj.title || 'Title not available'
    this.authors = obj.authors || 'Author not available'
    this.image_url = obj.imageLinks.thumbnail ? obj.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = obj.description || 'Description not available'
    this.isbn = obj.industryIdentifiers[0].identifier;
    this.bookshelf = ""
}

function errorHandler(error, request, response) {
    response.status(500).send({ status: 500, responseText: 'That did not go as expected' });
}

dbClient.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        })
    });