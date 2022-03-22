const express = require('express')
const dbFacade = require('../db/dbFacade.js')
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
const path = require('path')

const app = express()
const port = 5000

//middleware
app.use(express.json())
app.use(cookieParser());

//patial files
require('../authServers/userAuthServer.js')(app)
require('../apiServers/userApiServer.js')(app)
require('../apiServers/trackerApiServer.js')(app)
require('../pagesServer/pagesServer.js')(app, express)

//initialization functions
dbFacade.connect().then((response) => {
    dotenv.config()
    app.listen(port, () => {
      console.log(`Auth server listening on port ${port}`)
    })
  })