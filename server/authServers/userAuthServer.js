const TIME_PERIODS = require('../../custom_modules/time_periods_in_ms.js')
var jwt = require('jsonwebtoken');
const dbFacade = require('../db/dbFacade.js')
const dotenv = require('dotenv');
const authMiddleware = require('./middleware.js')

module.exports = function(app)
{
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

  app.post('/logout', authMiddleware.authenticateToken, (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshtoken');
    res.json({message: "Successfully signed out."})
  })

  app.post('/deleteAccount', authMiddleware.authenticateToken, (req, res) => {

    dbFacade.validUserCredentials(req.user.email, req.body.password)
      .then((response) => {
        if(response.returnValue)
        {
          dbFacade.deleteAccount(req.user.email)
            .then((response) => {
              if(response.success)
              {
                res.clearCookie('token');
                res.clearCookie('refreshtoken');
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
}