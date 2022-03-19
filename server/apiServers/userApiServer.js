const authMiddleware = require('../authServers/middleware.js')
const dbFacade = require('../db/dbFacade.js')

module.exports = function(app)
{
  app.post('/createToggleActivationRequest', authMiddleware.authenticateToken, (req, res) => {
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
}