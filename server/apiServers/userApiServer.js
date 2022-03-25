const { reject } = require('bcrypt/promises')
const authMiddleware = require('../authServers/middleware.js')
const dbFacade = require('../db/dbFacade.js')

module.exports = function(app)
{
  app.post('/api/createToggleActivationRequest', authMiddleware.authenticateToken, (req, res) => {
    dbFacade.validToggleActivationRequest(
      req.body.serialNumber,
      req.user.email)
      .then((response) => {
          dbFacade.toggleActivationRequestExists(req.body.serialNumber)
          .then((response) => {
            dbFacade.createToggleActivationRequest(
              req.body.serialNumber,
              req.user.email
            )
            .then((response) => {
              //ta bort requesten efter 10 sec
              setTimeout(() => {
                dbFacade.deleteToggleActivationRequest(req.body.serialNumber)
              }, 10000);

              res.status(201)
              return res.send()

            }).catch(err => {
              res.status(400)
              return res.send()
            })
          }).catch(err => {
            res.status(400)
            return res.send()
          })
        }).catch(err => {
          res.status(400)
          return res.send()
        })
  })

  app.get('/api/userDevices', authMiddleware.authenticateToken, (req, res) => {

    devices = {
      trackers: []
    }

    dbFacade.getAllUserTrackers(req.user.email)
    .then(response => {
      devices.trackers = response

      res.status(200)
      return res.json(devices)
    }).catch(err => {
      console.log(err)

      res.status(400)
      return res.send()
    })
  })
}