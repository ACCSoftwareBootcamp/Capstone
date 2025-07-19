//use express to run server through node.js
const express = require('express')
//create an instance of express
const app = express()
//establish port for listening
const PORT=process.env.PORT || 3000
//use a logger to track requests
const logger= require('morgan')


//middleware---for use between req and res cylces
app.use(logger('dev'))


//routes

//Read

//establish root route
app.get('/', (req, res) => {
    res.send('Root Route')
})



//Create--need routes for user, tree, branch

//Update-need routes for user, tree, branch

//Delete-need routes for user, tree, branch

//listen
app.listen(PORT, ()=> console.log(`FotoTree App is listening on PORT: ${PORT} `))