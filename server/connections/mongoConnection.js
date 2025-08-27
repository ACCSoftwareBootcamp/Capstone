// imports dotenv and runs it, reading the .env file
require('dotenv').config({ path: '.env' });
// import mongoose
const mongoose = require('mongoose')

// create connection object from process.env
const {URI, MONGO_USER, MONGO_PASSWORD, MONGO_DB, MONGO_PORT, MONGO_HOST} = process.env; 

// Build the connection string
// const URL=`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`
const URL=`${URI}/${MONGO_DB}`;
// console.log('URL is: ', URL); 

const connObj = {
    authSource: 'admin', 
    user: MONGO_USER, 
    pass: MONGO_PASSWORD
}

//connect to db using these properties - actually connect to mongo
mongoose.connect(URL, connObj) 
    .then(function(){
        console.log(`connected to MongoDB: ${MONGO_DB}`)
    })
    .catch(function(error){
        console.log('MongoDB connection failed', error)
    })

    