'use strict';

const pg = require('pg');
const fs = require('fs');
const express = require('express');

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
const conString = 'postgres://postgres:c0de@localhost:5432/postgres';

// Mac:
// const conString = 'postgres://localhost:5432';

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // The code below corresponds to '5' on the full-stack diagram-- the server responding to a request, defined above, with the html file indicated below. Article.js doesn't directly interact with this path. In this case the method is reading new.html from the server so that it can send it.  
  response.sendFile('new.html', { root: './public' });
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines correspond to '3', that is, sending a query to the database. These lines don't interact directly with article.js, except when later the fetchAll method draws from the server data. The CRUD part indicated here is 'create' because we are creating the table structure in the database. Afterwards, '4' sends the created table to the server. 
  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines correspond to '3', which is querying the server. The method in article.js that's being used is insertRecord. We are using Create.
  client.query(
      `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `, [
        request.body.title,
        request.body.author,
        request.body.authorUrl,
        request.body.category,
        request.body.publishedOn,
        request.body.body
      ]
    )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines also correspond to '3'. It's interacting with updateRecord. This is Update from CRUD.
  console.log(request.body.article_id);
  client.query(
      `UPDATE articles
      SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
      WHERE article_id=$7;`, [
        request.body.title,
        request.body.author,
        request.body.authorUrl,
        request.body.category,
        request.body.publishedOn,
        request.body.body,
        request.params.id
      ]
    )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is still '3' from the diagram. It's interacting with deleteRecord. The CRUD step is Delete.
  client.query(
      `DELETE FROM articles WHERE article_id=$1;`, [request.params.id]
    )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is '3' from the diagram. It's interacting with truncateTable. This is also Delete from CRUD.
  client.query(
      `DELETE FROM articles;`
    )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENT: What is this function invocation doing?
// It's loading the database.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is '4' from the diagram, which sends the result from the database to the server. It's interacting with is fetchAll. This is Read from CRUD.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
      // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
      // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
      // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if (!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `, [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body])
          })
        })
      }
    })
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is '4' from the diagram. It creates the table for our articles and sends it to the server. It's interacting with fetchAll in article.js. This is Create from CRUD, because it's creating and populating the table.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`)
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}