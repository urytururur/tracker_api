const express = require('express')
const dbFacade = require('../db/dbFacade.js')

const app = express()
const port = 5000

app.use(express.json())

app.post('/signup', (req, res) => {
  dbFacade.userExists(req.body.email)
    .then((response) => {
      if(!response.returnValue)
      {
        dbFacade.signUpUser(req.body.email, req.body.password, '123456') //fixa random salt
          .then((response) => {
            if(response.success)
            {
              res.status(200);
              res.json({message: `Signed up successfully.`})
            }
          })
      }
      else
      {
        res.status(400);
        res.json({message: 'User already exists.'});
      }
    })
})

app.post('/login', (req, res) => {
  //TODO:
  //validatea email och password mot databasen
    //om ej valid
      //rejecta requesten med ett meddelande "Wrong username or password"
    //om valid -> generera
      //generera jwt
      //sätt jwt:n som en säker cookie hos clienten (!read, !write)
})

app.post('/logout', (req, res) => {
  //TODO:
  //ta bort den säkra cookien med jwt:n från clienten
})

app.post('/deleteAccount', (req, res) => {

  dbFacade.validUserCredentials(req.body.email, req.body.password)
    .then((response) => {
      if(response.returnValue)
      {
        dbFacade.deleteAccount(req.body.email)
          .then((response) => {
            if(response.success)
            {
              res.status(200)
              res.json({message: `Account deleted successfully.`})
            }
          })
      }
      else
      {
        res.status(400)
        res.json({message: `Wrong email or password.`})
      } 
    })
})

app.post('/createToggleActivationRequest', (req, res) => {
  dbFacade.validToggleActivationRequest(
    req.body.serialNumber,
    req.body.hashedPhysicalSecurityKey,
    req.body.email)
      .then((response) => {
        if(response.returnValue)
        {
          dbFacade.toggleActivationRequestExists(req.body.serialNumber)
            .then((response) => {
              if(!response.returnValue)
              {
                dbFacade.createToggleActivationRequest(
                  req.body.serialNumber,
                  req.body.email
                )
                .then((response) => {
                  //ta bort requesten efter 10 sec
                  setTimeout(() => {
                    dbFacade.deleteToggleActivationRequest(req.body.serialNumber)
                  }, 10000);

                  res.status(200)
                  res.json({message: `Attempt to initialize tracker toggle activation request has been made.`})
                })
              }
              else
              {
                res.status(400)
                res.json({message: `toggle activation request for tracker already exist.`})
              }
            })
        }
        else
        {
          res.status(400)
          res.json({message: `Invalid request parameters`})
        }
      })
})

app.post('/toggleTrackerActive', (req, res) => {
  //check valid, loose security key
  dbFacade.validTrackerCredentials(
    req.body.serialNumber,
    req.body.hashedPhysicalSecurityKey)
      .then((response) => {
        if(response.returnValue)
        {
          dbFacade.toggleTrackerActive(
            req.body.serialNumber,
            req.body.hashedPhysicalSecurityKey
            )
            .then((response) => {
              if(response.success)
              {
                res.status(200)
                res.json(`Attemt to toggle tracker has been made`)
              }
            })
        }
        else
        {
          res.status(400)
          res.json({message: `Invalid tracker credentials.`})
        }
    })
})

//initialization functions
dbFacade.connect().then((response) => {
  app.listen(port, () => {
    console.log(`Auth server listening on port ${port}`)
  })
})