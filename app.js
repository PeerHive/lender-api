const express = require('express');
const BodyParser = require('body-parser');
const database = require('./models/databases');
const authRoutes = require('./routes/authRoutes');
const mainpageRoute = require('./routes/mainpageRoutes');

const app = express();
const port = 5000; // Open port 5000 from the localhost

// JSON Encoding allowing JSON Body to be parsed
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));


app.use('/auth', authRoutes); // Authentication sub route API
app.use('/main', mainpageRoute); // Main sub route API 

// Listening and initializing of API at port 5000
app.listen(port, (error) => {
    if (error) console.log("Error in server setup")
    console.log("Server listening on Port", port);
});


// Hello World page
app.get('/hello_world', (req,res)=>{
    res.send('Hello World, welcome to PeerHive app');
});

