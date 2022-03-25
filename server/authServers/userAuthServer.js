const TIME_PERIODS = require('../../custom_modules/time_periods_in_ms.js')
var jwt = require('jsonwebtoken');
const dbFacade = require('../db/dbFacade.js')
const dotenv = require('dotenv');
const authMiddleware = require('./middleware.js')
const bcrypt = require("bcrypt");
const { hash } = require('bcrypt');
const res = require('express/lib/response');

module.exports = function main(app)
{
  app.get('/isSignedIn', (req, res) => {
    if(req.cookies.token)
    {
      res.status(204)
      return res.send()
    }
    else
    {
      res.status(401)
      return res.send()
    }
  });

  app.get('/refreshToken', (req, res) => {

    if (!req.cookies.refreshtoken) {
      res.status(401)
      return res.send();
    }

    jwt.verify(req.cookies.refreshtoken, process.env.SHA256_REFRESHTOKEN_KEY, (err, user) => {
        if (err) {
          res.status(401)
          return res.send();
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
              
              res.status(202)
              return res.send();
            });
          }
          else
          {
            res.status(401)
            return res.send();
          }
        })
      })
  });

  app.post('/signup', (req, res) => {
    dbFacade.userExists(req.body.email)
      .then((response) => {
          hashPassword(req.body.password, (err, hashedPassword) => {
            dbFacade.signUpUser(req.body.email, hashedPassword)
            .then((response) => {
              
              res.status(201)
              return res.send()
            }).catch(err => {
              console.log(err)

              res.status(500)
              return res.send()
            })
          })
      }).catch(err => {
        console.log(err)

        res.status(400)
        return res.send()
      })
  })

  app.post('/login', (req, res) => {
      validateUserCredentials(req.body.email, req.body.password, (match) => {
        if(!match)
        {
          res.status(401)
          return res.send()
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

            res.status(204)
            return res.send()
          });
        });
      })
  })

  app.post('/logout', (req, res) => {
    console.log(1)
    res.clearCookie('token');
    console.log(2)
    res.clearCookie('refreshtoken');
    console.log(3)

    res.status(204)
    return res.send()
  })

  app.post('/deleteAccount', authMiddleware.authenticateToken, (req, res) => {

    validateUserCredentials(req.user.email, req.body.password, (match) => {
      if(match)
        {
          dbFacade.deleteAccount(req.user.email)
            .then((response) => {
              res.clearCookie('token');
              res.clearCookie('refreshtoken');

              res.status(204)
              return res.send()
            }).catch(err => {
              console.log(err)

              res.status(400)
              return res.send()
            })
        }
        else
        {
          res.status(401)
          return res.send()
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
  dbFacade.getUser(email)
  .then(user => {

    bcrypt.compare(password, user.hashedPassword, (err, match) => {
        callback(match);
    })
  }).catch(err => {
    console.log(err)

    callback(false)
  })
}