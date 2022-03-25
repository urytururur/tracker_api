const dbFacade = require('../db/dbFacade.js')

module.exports = function(app)
{
    app.post('/api/toggleTrackerActiveButton', (req, res) => {
        dbFacade.validTrackerCredentials(
          req.body.serialNumber,
          req.body.hashedPhysicalSecurityKey)
            .then((response) => {
                dbFacade.getToggleRequest(req.body.serialNumber)
                .then((response) => {
                    dbFacade.toggleTrackerActive(
                        req.body.serialNumber,
                        req.body.hashedPhysicalSecurityKey,
                        response.data.userEmail
                    )
                    .then((response) => {
                        res.status(204)
                        return res.send()
                    }).catch(err => {
                        console.log(err)
                        
                        res.status(400)
                        return res.send()
                    })
                }).catch(err => {
                    console.log(err)

                    res.status(404)
                    return res.send()
                })
            }).catch(err => {
                console.log(err)

                res.status(401)
                return res.send()
            })
        })
}

