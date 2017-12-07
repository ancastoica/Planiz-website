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
            users: [{id: id_user, name: planiz_object.username}]
        };

        req.session.userId = id_user;

        db.collection("planiz").insert(newObj, null, function (err, result) {
            if (err) {
                throw err;
            } else {

                var objectId = newObj._id;
                res.redirect('/'+objectId+'/dashboard');
            }
        });
    });

    /* GET homepage for planiz_id */
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
        console.log("Je suis ici 1");
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                console.log(result._id);
                res.render('dashboard', {title:result.title, planiz: result})
            }
        });
    });

    /* GET dates page for planiz_id */
    router.get('/:planiz_id/dates', function (req, res) {
        console.log("Je suis ici 1");
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                console.log(result._id);
                res.render('dates', {title:result.title, planiz: result})
            }
        });
    });

    /* GET destinations page for planiz_id */
    router.get('/:planiz_id/destination', function (req, res) {
        console.log("Je suis ici 1");
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                console.log(result._id);
                res.render('destination', {title:result.title, planiz: result})
            }
        });
    });

    /* GET budget page for planiz_id */
    router.get('/:planiz_id/budget', function (req, res) {
        console.log("Je suis ici 1");
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                console.log(result._id);
                res.render('budget', {title:result.title, planiz: result})
            }
        });
    });
});

module.exports = router;
