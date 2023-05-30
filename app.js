const express = require('express');
const BodyParser = require('body-parser');
const database = require('./models/databases');
const authRoutes = require('./routes/authRoutes');
const mainpageRoute = require('./routes/mainpageRoutes');

const app = express();
const port = 5000;

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use('/auth', authRoutes);
app.use('/main', mainpageRoute);
var collection;

app.listen(port, (error) => {
    if (error) console.log("Error in server setup")
    console.log("Server listening on Port", port);
});

app.get('/hello_world', (req,res)=>{
    res.send('Hello World, welcome to PeerHive app');
});

