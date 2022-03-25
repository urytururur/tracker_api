const { redirect } = require('express/lib/response');
var jwt = require('jsonwebtoken');
const path = require('path')

//middleware
function authenticateToken(req, res, next)
{
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

module.exports = {
    authenticateToken: authenticateToken
}



module.exports = {
    authenticateToken: authenticateToken
}