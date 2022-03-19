const dotenv = require('dotenv');
const express = require('express')
const dbFacade = require('../db/dbFacade.js')
const TIME_PERIODS = require('../../custom_modules/time_periods_in_ms.js')
var jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const app = express()
const port = 5000

//middleware
app.use(express.json())
app.use(cookieParser());

function authenticateToken(req, res, next) {

  if (req.cookies.token == null)
  {
    res.status(401)
    return res.json({
      message: "You are not signed in."
    })
  }

  jwt.verify(req.cookies.token, process.env.SHA256_TOKEN_KEY, (err, user) => {
    if (err)
    {
      console.log(err)

      res.status(403)
      return res.json({
        message: "Forbidden request."
      }) 
    }
    req.user = user
    next()
  })
}

//routes
app.post('/refreshToken', (req, res) => {

  if (!req.cookies.refreshtoken) {
    return res.sendStatus(401);
  }

  jwt.verify(req.cookies.refreshtoken, process.env.SHA256_REFRESHTOKEN_KEY, (err, user) => {
      if (err) {
          return res.sendStatus(403);
      }

      dbFacade.validUserCredentials(user.email, user.password)
        .then((response) => {
          if(response.returnValue)
          {
            jwt.sign({email: user.email}, process.env.SHA256_TOKEN_KEY, {
              algorithm: 'HS256',
              expiresIn: '15m'
            }, (err, token) => {
      
              res.cookie("token", token, {
                //secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                maxAge:  15 * TIME_PERIODS.MINUTE
              });
      
              res.json({
                message: "Successfully refreshed token."
              });
            });
          }
          else
          {
            return res.sendStatus(403);
          }
        })
  });
});

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
  dbFacade.validUserCredentials(req.body.email, req.body.password)
  .then((response) => {
    if(!response.returnValue)
    {
      res.status(401)
      res.json({message: "Wrong email or password."})
    }
    else
    {
      jwt.sign({email: req.body.email}, process.env.SHA256_TOKEN_KEY, {
        algorithm: 'HS256',
        expiresIn: '15m'
      }, (err, token) => {

        res.cookie("token", token, {
          //secure: process.env.NODE_ENV !== "development",
          httpOnly: true,
          maxAge:  15 * TIME_PERIODS.MINUTE
        });

        jwt.sign({email: req.body.email, password: req.body.password}, process.env.SHA256_REFRESHTOKEN_KEY, {
          algorithm: 'HS256',
          expiresIn: '7d'
        }, (err, refreshtoken) => {

          res.cookie("refreshtoken", refreshtoken, {
            //secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            maxAge:  1 * TIME_PERIODS.WEEK
          });

          res.status(200)
          res.json({message: "Logged in successfully."})
        });
      });
    }
  })
})

app.post('/logout', authenticateToken, (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshtoken');
  res.json({message: "Successfully signed out."})
})

app.post('/deleteAccount', authenticateToken, (req, res) => {

  dbFacade.validUserCredentials(req.user.email, req.body.password)
    .then((response) => {
      if(response.returnValue)
      {
        dbFacade.deleteAccount(req.user.email)
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

app.post('/createToggleActivationRequest', authenticateToken, (req, res) => {
  dbFacade.validToggleActivationRequest(
    req.body.serialNumber,
    req.body.hashedPhysicalSecurityKey,
    req.user.email)
      .then((response) => {
        if(response.returnValue)
        {
          dbFacade.toggleActivationRequestExists(req.body.serialNumber)
            .then((response) => {
              if(!response.returnValue)
              {
                dbFacade.createToggleActivationRequest(
                  req.body.serialNumber,
                  req.user.email
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

app.post('/toggleTrackerActiveButton', (req, res) => {
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
  dotenv.config()
  app.listen(port, () => {
    console.log(`Auth server listening on port ${port}`)
  })
})