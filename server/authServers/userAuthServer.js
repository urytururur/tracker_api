const TIME_PERIODS = require('../../custom_modules/time_periods_in_ms.js')
var jwt = require('jsonwebtoken');
const dbFacade = require('../db/dbFacade.js')
const dotenv = require('dotenv');
const authMiddleware = require('./middleware.js')
const bcrypt = require("bcrypt");
const { hash } = require('bcrypt');
const res = require('express/lib/response');

module.exports = function(app)
{
  app.get('/isSignedIn', (req, res) => {
    if(!req.cookies.token)
    {
      return res.json(false)
    }
    else
    {
      return res.json(true)
    }
  });

  app.post('/refreshToken', (req, res) => {

    if (!req.cookies.refreshtoken) {
      console.log(1)
      return res.sendStatus(401);
    }

    jwt.verify(req.cookies.refreshtoken, process.env.SHA256_REFRESHTOKEN_KEY, (err, user) => {
        if (err) {
            console.log(2)
            return res.sendStatus(403);
        }
        validateUserCredentials(user.email, user.password, (match) => {
          if(match)
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
      
              return res.json({
                message: "Successfully refreshed token."
              });
            });
          }
          else
          {
            return res.sendStatus(403);
          }
        })
      })
  });

  app.post('/signup', (req, res) => {
    dbFacade.userExists(req.body.email)
      .then((response) => {
        if(!response.data)
        {
          hashPassword(req.body.password, (err, hashedPassword) => {
            dbFacade.signUpUser(req.body.email, hashedPassword)
            .then((response) => {
              if(response.err) return res.status(500)

              res.status(200);
              return res.json({message: `Signed up successfully.`})
            })
          })
        }
        else
        {
          res.status(400);
          return res.json({message: 'User already exists.'});
        }
      })
  })

  app.post('/login', (req, res) => {
      validateUserCredentials(req.body.email, req.body.password, (match) => {
        if(!match)
        {
          res.status(401)
          return res.json({message: "Wrong email or password."})
        }

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
            return res.json({message: "Logged in successfully."})
          });
        });
      })
  })

  app.post('/logout', authMiddleware.authenticateToken, (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshtoken');
    return res.json({message: "Successfully signed out."})
  })

  app.post('/deleteAccount', authMiddleware.authenticateToken, (req, res) => {

    validateUserCredentials(req.user.email, req.body.password, (match) => {
      if(match)
        {
          dbFacade.deleteAccount(req.user.email)
            .then((response) => {
              if(response.err) return res.status(500)

              res.clearCookie('token');
              res.clearCookie('refreshtoken');
              res.status(200)
              return res.json({message: `Account deleted successfully.`})
            })
        }
        else
        {
          res.status(400)
          return res.json({message: `Wrong password.`})
        } 
      })
    })

}

//helper functions
function hashPassword(password,/* salt,*/ callback)
{
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        // Store hash in your password DB.
        console.log(`hashedPassword: ${hash}`);
        
        callback(err, hash)
    });
  });
}

function validateUserCredentials(email, password, callback)
{
  console.log(email)
  console.log(password)

  dbFacade.getUser(email)
  .then((response) => {
    if(response.err) return res.status(500)

    if(response.data == undefined)
    {
      callback(false)
      return;
    }

    bcrypt.compare(password, response.data.hashedPassword, (err, match) => {
        callback(match);
    })
  })
}