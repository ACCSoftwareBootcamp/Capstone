//use express to run server through node.js
const express = require('express')
//create an instance of express
const app = express()
//establish port for listening
const PORT=process.env.PORT || 5000
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
app.use(cors(  ))


//middleware---for use between req and res cylces
app.use(logger('dev'))

// middleware - I want to add the ability to read req.body
app.use(express.json())
// example: '{"description": 'Climb Mt. Fuji'}
app.use(express.urlencoded())


// connect the db to backend server
require('./connections/mongoConnection.js')

//ROUTES
// READ - GET routes for root, user, tree, branch
//establish root route
app.get('/', (req, res) => {
    res.send('Root Route')
});
//READ - GET for person
app.get('/person', function(req, res) {
    person.find({})
    .then(function(data) {
        res.json(data)
    })
    .catch(function(error) {
        console.log('Error getting from Mongo person', error)
        res.status(400).json({ message: 'Error getting from Mongo person' })
    })
});
//READ - GET for user
//made server accept clerk id to return our id using url params
app.get('/user/:clerkId', function(req, res) {
    const { clerkId } = req.params
    user.findOne({clerkId})
    .then(function(data) {
     if (!data) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(data);
    })
    .catch(function(error) {
        console.log('Error getting from Mongo user', error)
        res.status(400).json({ message: 'Error getting from Mongo user' })
    })
});
//READ - GET for tree
app.get('/tree/:owner', function(req, res) {
    const {owner}=req.params
    tree.findOne({owner})
    .then(function(data) {
        res.json(data)
    })
    .catch(function(error) {
        console.log('Error getting from Mongo tree', error)
        res.status(400).json({ message: 'Error getting from Mongo tree' })
    })
}); 


//CREATE - POST routes for user, tree, branch
// CREATE - POST for person
app.post('/person', function(req, res) {

    const { treeId, firstName,lastName  } = req.body; 

    person.create ({
        treeId, firstName, lastName
    })
    .then  (function (data) {
        res.json(data)
    })
    .catch(function (error) {
        console.log('Error posting to Mongo person', error)
        res.status(400).json({ message: 'Error posting to Mongo person' })
    })

});

//CREATE - POST for user 
app.post('/user', function(req, res) {

    const { clerkId } = req.body; 

    user.create ({
        clerkId
    })
    .then  (function (data) {
        res.json(data)
        console.log("New User Created", data)
    })
    .catch(function (error) {
        console.log('Error posting to Mongo - user', error)
        res.status(400).json({ message: 'Error posting to Mongo - user' })
    })

})


// CREATE POST for tree
app.post('/tree', function(req, res) {

    const {  name, owner, description } = req.body; 

    tree.create ({
        name, owner, description
    })
    .then  (function (data) {
        res.json(data)
    })
    .catch(function (error) {
        console.log('Error posting to Mongo tree', error)
        res.status(400).json({ message: 'Error posting to Mongo tree' })
    })

})


//UPDATE - PUT routes for user, tree, branch
// UPDATE - PUT for person
app.put('/person/:id', function(req, res) {
    const { id } = req.params;
    const { treeId, firstName, lastName } = req.body; 

    person.findByIdAndUpdate(id, {
        treeId, firstName, lastName
    }, { new: true })
    .then(function(data) {
        res.json(data)
    })
    .catch(function(error) {
        console.log('Error updating Mongo person', error)
        res.status(400).json({ message: 'Error updating Mongo person' })
    })
});
// UPDATE - PUT for user
app.put('/user/:id', function(req, res) {
    const { id } = req.params;
    const { clerkId, personId, trees } = req.body; 

    user.findByIdAndUpdate(id, {
        clerkId, personId, trees
    }, { new: true })
    .then(function(data) {
        res.json(data)
    })
    .catch(function(error) {
        console.log('Error updating Mongo user', error)
        res.status(400).json({ message: 'Error updating Mongo user' })
    })
});
// UPDATE - PUT for tree
app.put('/tree/:id', function(req, res) {
    const { id } = req.params;
    const { name, owner, description, nodes, edges } = req.body;
    tree.findByIdAndUpdate(id, {
        name, owner, description
    }, { new: true })
    .then(function(data) {
        res.json(data)
    }) 
    .catch(function(error) {
        console.log('Error updating Mongo tree', error)
        res.status(400).json({ message: 'Error updating Mongo tree' })
    })
});

//DELETE - DELETE routes for user, tree, branch
// DELETE - DELETE for person
app.delete('/person/:id', function(req, res) {
    const { id } = req.params;

    person.findByIdAndDelete(id)
    .then(function(data) {
        res.json(data)
    })
    .catch(function(error) {
        console.log('Error deleting from Mongo person', error)
        res.status(400).json({ message: 'Error deleting from Mongo person' })
    })
});
// DELETE - DELETE for user
app.delete('/user/:id', function(req, res) {
    const { id } = req.params;

    user.findByIdAndDelete(id)
    .then(function(data) {
        res.json(data)
    })
    .catch(function(error) {
        console.log('Error deleting from Mongo user', error)
        res.status(400).json({ message: 'Error deleting from Mongo user' })
    })
});
// DELETE - DELETE for tree
app.delete('/tree/:id', function(req, res) {
    const { id } = req.params;

    tree.findByIdAndDelete(id)
    .then(function(data) {
        res.json(data)
    })
    .catch(function(error) {
        console.log('Error deleting from Mongo tree', error)
        res.status(400).json({ message: 'Error deleting from Mongo tree' })
    })
});

//listen
app.listen(PORT, ()=> console.log(`FotoTree App is listening on PORT: ${PORT} `))