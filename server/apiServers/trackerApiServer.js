const dbFacade = require('../db/dbFacade.js')

module.exports = function(app)
{
    app.post('/toggleTrackerActiveButton', (req, res) => {
        dbFacade.validTrackerCredentials(
          req.body.serialNumber,
          req.body.hashedPhysicalSecurityKey)
            .then((response) => {
                if(response.err) return res.status(500)
                if(response.data)
                {
                    dbFacade.getToggleRequest(req.body.serialNumber)
                    .then((response) => {
                        if(response.err) return res.status(500)

                        if(response.data == undefined)
                        {
                            res.status(400)
                            return res.json({message: "No activation request."})
                        }

                        dbFacade.toggleTrackerActive(
                            req.body.serialNumber,
                            req.body.hashedPhysicalSecurityKey,
                            response.data.userEmail
                            )
                            .then((response) => {
                                if(response.err) return res.status(500)

                                res.status(200)
                                return res.json(`Attemt to toggle tracker has been made`)
                            })
                    })
                }
                else
                {
                    res.status(400)
                    return res.json({message: `Invalid tracker credentials.`})
                }
            })
        })
}

