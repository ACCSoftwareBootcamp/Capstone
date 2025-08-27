//use express to run server through node.js
const express = require('express')
//create an instance of express
const app = express()
//establish port for listening
const PORT=process.env.PORT || 5001
//use a logger to track requests
const logger= require('morgan')
const morgan = require('morgan');

//use dotenv to read .env file
const dotenv = require('dotenv').config({ path: './.env' });
//import cloudinary to upload files
const cloudinary = require('./connections/cloudinary');

const cors = require('cors');

//importing mongoose model
const tree = require('./models/tree'); 
const user = require('./models/user'); 
const person = require('./models/person'); 

// open up the CORS setting server so any browser client can access this
app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you need to send cookies/auth headers
}))

//import multer to handle file uploads
const multer = require("./middleware/multer");

//DB Model
const ImageModel = require('./models/Image') // Import the Image model

//middleware---for use between req and res cylces
app.use(logger('dev'))

// middleware - I want to add the ability to read req.body
app.use(express.json())
// example: '{"description": 'Climb Mt. Fuji'}
app.use(express.urlencoded())
// open the uploads folder so we can read it 
app.use(express.static(__dirname + '/uploads/'))

// connect the db to backend server
require('./connections/mongoConnection.js')

//DB Model
const Image = require("./models/Image"); // Import the Image model
const upload = require("./middleware/multer");

//ROUTES
// READ - GET routes for root, user, tree, branch
//establish root route
app.get('/', (req, res) => {
    res.send('Root Route')
});
//READ - GET for person
//READ - GET for all persons OR filter by creator
app.get('/person', function(req, res) {
    const { creator } = req.query;  // ?creator=someId
    const filter = creator ? { creator } : {};

    person.find(filter)
    .sort({ firstName: 1 }) // sort by first name
    .then(function(data) {
        res.json(data);
    })
    .catch(function(error) {
        console.log('Error getting from Mongo person', error);
        res.status(400).json({ message: 'Error getting from Mongo person' });
    });
});

//READ - GET for single person by id
app.get('/person/:id', function(req, res) {
    const { id } = req.params;

    person.findById(id)
    .then(function(data) {
        if (!data) {
            return res.status(404).json({ message: 'Person not found' });
        }
        res.json(data);
    })
    .catch(function(error) {
        console.log('Error getting single Mongo person', error);
        res.status(400).json({ message: 'Error getting single Mongo person' });
    });
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
// TODO - add all fields 
app.post('/person', function(req, res) {

    const { treeId, firstName,lastName, creator, photoArray  } = req.body; 

    person.create ({
        treeId, firstName, lastName, creator, photoArray
    })
    .then  (function (data) {
        res.json(data)
    })
    .catch(function (error) {
        console.log('Error posting to Mongo person', error)
        res.status(400).json({ message: 'Error posting to Mongo person' })
    })

});

//CREATE - POST route for image upload
// multer captures the image and stores it on the hard disk of server
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file){
        console.log('no req.file')
        return res.status(400).json({ error: 'No file upload'})
    }

    //Upload our image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path)

    //Upon successful response from cloudinary save url to DB
    const newImage = new ImageModel({
      imageUrl: result.secure_url,
    });

    // Now with the model, save it to mongoDB
    const savedImage = await newImage.save();
    res.json(savedImage);
  } catch (error) {
    // if error happens respond accordingly
    res.status(500).json({ error: "Something went wrong." });
  }
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

    // Validate or process nodes and edges if necessary
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return res.status(400).json({ message: 'Invalid data format for nodes or edges' });
    }

    tree.findByIdAndUpdate(id, {
        name,
        owner,
        description,
        nodes,    
        edges,   
    }, { new: true })
    .then(function(data) {
        res.json(data); // Send updated tree
    })
    .catch(function(error) {
        console.log('Error updating Mongo tree', error);
        res.status(400).json({ message: 'Error updating Mongo tree' });
    });
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
app.listen(PORT, ()=> console.log(`FotoTree App is listening on PORT: ${PORT} `));