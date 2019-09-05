const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Init express app
var app = express();

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to database...');
    })
    .catch(e => {
        console.log(e);
    })

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/uri', (req, res) => {
    res.send(MONGO_URI);
})

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/user'));

// Listen
app.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`)
})