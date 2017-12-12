var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Homepage' });
});

/* GET create planiz form page. */
router.get('/createPlaniz', function (req, res) {
    res.render('createPlaniz', { title: 'Create' });
});

/* POST url where to go to */
router.post('/goToUrl', urlEncodedParser, function (req, res) {
    res.redirect(req.body.url);
});


module.exports = router;
