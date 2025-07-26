//use express to run server through node.js
const express = require('express')
//create an instance of express
const app = express()
//establish port for listening
const PORT=process.env.PORT || 3000
//use a logger to track requests
const logger= require('morgan')

const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');

//importing mongoose model
const tree = require('./models/tree'); 
const user = require('./models/user'); 
const person = require('./models/person'); 

// open up the CORS setting server so any browser client can access this
app.use(cors())


//middleware---for use between req and res cylces
app.use(logger('dev'))

// middleware - I want to add the ability to read req.body
app.use(express.json())
// example: '{"description": 'Climb Mt. Fuji'}
app.use(express.urlencoded())


// connect the db to backend server
require('./connections/mongoConnection')

//routes

//Read

//establish root route
app.get('/', (req, res) => {
    res.send('Root Route')
})



//Create--need routes for user, tree, branch
//POST for tree 
app.post('/tree', function(req, res) {

    const { name, owner, description } = req.body; 
    console.log(req.body); 

    tree.create ({
        name, owner, description
    })
    .then  (function (data) {
        res.json(data)
    })
    .catch(function (error) {
        console.log('Error posting to Mongo', error)
        res.status(400).json({ message: 'Error posting to Mongo' })
    })

})


//Update-need routes for user, tree, branch

//Delete-need routes for user, tree, branch

//listen
app.listen(PORT, ()=> console.log(`FotoTree App is listening on PORT: ${PORT} `))