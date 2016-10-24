var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('chat', { client_ip: req.ip.split(':').pop() });
});

module.exports = router;
