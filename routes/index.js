var express = require('express');
var router = express.Router();


var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});

const uuidv1 = require('uuid/v1');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Planiz' });
});


/* GET create planiz form page. */
router.get('/createPlaniz', function (req, res) {
    res.render('createPlaniz', { title: 'Planiz' });
});



/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);



    /* POST planiz lors de la creation
     * rajout planiz dans la bdd
     * rajout user qui a crée le planiz
      * */
    router.post('/createPlaniz', urlEncodedParser, function (req, res) {
        planiz_object = req.body;
        var id_user = uuidv1(); //random id user

        var newObj = {
            title: planiz_object.title,
            description: planiz_object.description,
            destinations: [],
            users: [{id: id_user, name: planiz_object.username}]
        };

        //req.session.userId = id_user;

        db.collection("planiz").insert(newObj, null, function (err, result) {
            if (err) {
                throw err;
            } else {

                var objectId = newObj._id;
                res.redirect('/'+objectId+'/dashboard');
            }
        });
    });

    /* GET homepage/dashboard for planiz_id */
    router.get('/:planiz_id', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                res.render('dashboard', {title:result.title, planiz: result})
            }
        });
    });

    /* GET homepage/dashboard for planiz_id */
    router.get('/:planiz_id/dashboard', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                res.render('dashboard', {title:result.title, planiz: result})
            }
        });
    });

    /* GET dates page for planiz_id */
    router.get('/:planiz_id/dates', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                res.render('dates', {title:result.title, planiz: result})
            }
        });
    });

    /* GET destinations page for planiz_id */
    router.get('/:planiz_id/destination', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                res.render('destination', {title:result.title, planiz: result})
            }
        });
    });

    /* GET budget page for planiz_id */
    router.get('/:planiz_id/budget', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                res.render('budget', {title:result.title, planiz: result})
            }
        });
    });

    /* POST new destination option
      * */
    router.post('/addDestination/:planiz_id', urlEncodedParser, function (req, res) {
        console.log("Je suis ici et id = "+req.params.planiz_id)
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").update({"_id": o_id}, { $push: { destinations: req.body.newoption } }, function(err, added) {
            if( err || !added ) {
                console.log("Destination not added.");
                callback(null,added);
            }
            else {
                console.log("Destination"+req.body.newoption+"added to "+o_id);
                res.redirect('/'+req.params.planiz_id+'/destination');
            }
        });
    });




});

module.exports = router;
