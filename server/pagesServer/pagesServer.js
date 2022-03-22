const authMiddleware = require('../authServers/middleware.js')
const path = require('path');
const res = require('express/lib/response');
const { nextTick } = require('process');

module.exports = function(app, express)
{
    app.use('/', express.static(path.join('client', 'build')))
}