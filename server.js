'use strict';

const express = require('express');
require('ejs');
require('dotenv').config();
const superagent = require('superagent');
// const pg = require('pg');
// const dbClient = new pg.Client(process.env.DATABASE_URL);
const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get('/', (request, response) => {
    response.render('pages/index.ejs');
})

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
    console.log(request.body);

    let url = `https://www.googleapis.com/books/v1/volumes?q=+in${titleorAuthor}:${query}`;

    // if(titleorAuthor === 'title') {
    //     url+=`+intitle:${query}`;
    // }else if(titleorAuthor === 'author'){
    //     url=+`inauthor:${query}`;
    // }

    superagent.get(url)
        .then(results => {
            let bookArray = results.body.items;
            console.log(results.body.items);
            let totalBookArray = bookArray.map(book => {
                return new Book(book.volumeInfo)
            });
            response.render('pages/searches/show.ejs', {searchResults: totalBookArray})
        }).catch(error => errorHandler(error, request, response))
})

function Book(obj) {
    this.title = obj.title || 'Title not available'
    this.authors = obj.authors || 'Author not available'
    this.image_url = obj.image_url || 'https://i.imgur.com/J5LVHEL.jpg'
    this.description = obj.description || 'Description not available'
}

function errorHandler(error, request, response) {
    response.status(500).send({status: 500, responseText: 'That did not go as expected'});
  }

app.get('*',(request, response) => {
    response.status(404).send('Sorry, that did not work');
})

// dbClient.connect()
//     .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        })
    // });