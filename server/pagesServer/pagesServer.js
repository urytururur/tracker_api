const path = require('path');
const res = require('express/lib/response');
const { nextTick } = require('process');

module.exports = function(app, express)
{
    app.use('/', express.static(path.join('client', 'build')))

    app.get('*',function (req, res) {
        res.status(300)
        return res.redirect('/');
    });
}