'use strict';

const express = require('express');
require('ejs');
require('dotenv').config();
// const superagent = require('superagent');
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

// app.get('*',(request, response) => {
//     response.status(404).send('Sorry, that did not work');
// })

// dbClient.connect()
//     .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        })
    // });