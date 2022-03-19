const dbFacade = require('../db/dbFacade.js')

module.exports = function(app)
{
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
}

