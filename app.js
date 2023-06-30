const express = require('express');
const BodyParser = require('body-parser');
const cors = require('cors')
const database = require('./models/databases');
const mainpageRoute = require('./routes/mainpageRoutes');
const portfolioRoute = require('./routes/portfolioRoutes');
const auth = require('./middlewares/authMiddleware');


const app = express();
const port = 5001; // Open port 5001 from the localhost

// JSON Encoding allowing JSON Body to be parsed
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(cors())


app.use('/main', auth.api_auth, mainpageRoute); // Main sub route API, with API middleware
app.use('/user', auth.api_auth, portfolioRoute); // Useer sub route API, with API middleware


// Listening and initializing of API at port 5001
app.listen(port, (error) => {
    if (error) console.log("Error in server setup")
    console.log("Server listening on Port", port);
});


// Hello World page
app.get('/hello_world', (req,res)=>{
    res.send('Hello World, welcome to PeerHive app');
});
