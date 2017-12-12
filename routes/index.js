var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Planiz' });
});

/* GET create planiz form page. */
router.get('/createPlaniz', function (req, res) {
    res.render('createPlaniz', { title: 'Planiz' });
});

module.exports = router;
