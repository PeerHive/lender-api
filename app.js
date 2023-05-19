const express = require('express');
const BodyParser = require('body-parser');
const database = require('./models/databases')

const app = express();
const port = 5000;

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var collection;

app.listen(port, (error) => {
    if (error) console.log("Error in server setup")
    console.log("Server listening on Port", port);
});

app.get('/hello_world', (req,res)=>{
    res.send('Hello World');
});

app.get("/SmartContract", (request, response) => {
    database.databaseQuery('SmartContract')
    .then((result) => {
        response.send(result);
    })
    .catch((error) => {
        return response.status(500).send(error);
    });
});

app.get("/loanpool", (request, response) => {
    database.databaseQuery('loanPool')
    .then((result) => {
        response.send(result);
    })
    .catch((error) => {
        return response.status(500).send(error);
    });
});