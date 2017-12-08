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
        var user = {id: id_user, name: planiz_object.username};

        var newObj = {
            title: planiz_object.title,
            description: planiz_object.description,
            destinations: [],
            users: [user]
        };

        req.session.userId = id_user;

        db.collection("planiz").insert(newObj, null, function (err, result) {
            if (err) {
                throw err;
            } else {

                var objectId = newObj._id;
                res.redirect('/'+objectId+'/'+id_user+'/dashboard');
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
                if(req.session.userId){
                    res.redirect('/'+req.params.planiz_id+'/'+req.session.userId+'/dashboard')
                }
                else{
                    res.redirect('/'+req.params.planiz_id+'/login')
                }

            }
        });
    });

    /* GET homepage/dashboard for planiz_id */
    router.get('/:planiz_id/:user_id/dashboard', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                if(req.session.userId) {
                    var users = result.users;
                    for (var i = 0; i < users.length; i++) {
                        // look for the entry with a matching `user_id` value
                        if (users[i].id == req.params.user_id) {
                            var user = users[i];
                        }
                    }
                    res.render('dashboard', {title: result.title, planiz: result, user:user})
                }
                else{
                    res.redirect('/'+req.params.planiz_id+'/login');
                }
            }
        });
    });

    /* GET login page for planiz_id */
    router.get('/:planiz_id/login', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                res.render('login', {title:result.title, planiz: result})
            }
        });
    });

    /* GET logout */
    router.get('/:planiz_id/logout', function (req, res) {
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            }
            else
            {
                res.redirect('/'+req.params.planiz_id+'/login');
            }
        });
    });

    /* GET login page for planiz_id */
    router.get('/:planiz_id/:user_id/login', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                var users = result.users;
                for (var i = 0; i < users.length; i++){
                    // look for the entry with a matching `user_id` value
                    if (users[i].id == req.params.user_id){
                        var user = users[i];
                        req.session.userId = users[i].id;
                    }
                }
                res.render('dashboard', {title:result.title, planiz: result, user: user})
            }
        });
    });

    /* POST new user for planiz_id */
    router.post('/:planiz_id/addUser', function (req, res) {

        var o_id = new mongo.ObjectID(req.params.planiz_id);
        var id_user = uuidv1(); //random id user

        db.collection("planiz").update({"_id": o_id}, { $push: { users: {id: id_user, name: req.body.username} } }, function(err, added) {
            if( err || !added ) {
                console.log("User not added.");
                callback(null,added);
            }
            else {
                console.log("User "+req.body.username+" added to "+o_id);
                res.redirect('/'+req.params.planiz_id+'/login');
            }
        });
    });

    /* GET dates page for planiz_id */
    router.get('/:planiz_id/:user_id/dates', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                var users = result.users;
                for (var i = 0; i < users.length; i++){
                    // look for the entry with a matching `user_id` value
                    if (users[i].id == req.params.user_id){
                        var user = users[i];
                        req.session.userId = users[i].id;
                    }
                }
                res.render('dates', {title:result.title, planiz: result, user:user})
            }
        });
    });

    /* GET destinations page for planiz_id */
    router.get('/:planiz_id/:user_id/destination', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                var users = result.users;
                for (var i = 0; i < users.length; i++){
                    // look for the entry with a matching `user_id` value
                    if (users[i].id == req.params.user_id){
                        var user = users[i];
                        req.session.userId = users[i].id;
                    }
                }
                res.render('destination', {title:result.title, planiz: result, user:user})
            }
        });
    });

    /* GET budget page for planiz_id */
    router.get('/:planiz_id/:user_id/budget', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                var users = result.users;
                for (var i = 0; i < users.length; i++){
                    // look for the entry with a matching `user_id` value
                    if (users[i].id == req.params.user_id){
                        var user = users[i];
                        req.session.userId = users[i].id;
                    }
                }
                res.render('budget', {title:result.title, planiz: result, user:user})
            }
        });
    });

    /* POST new destination option
      * */
    router.post('/:planiz_id/:user_id/addDestination', urlEncodedParser, function (req, res) {
        console.log("Je suis ici et id = "+req.params.planiz_id)
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").update({"_id": o_id}, { $push: { destinations: req.body.newoption } }, function(err, added) {
            if( err || !added ) {
                console.log("Destination not added.");
                callback(null,added);
            }
            else {
                console.log("Destination"+req.body.newoption+"added to "+o_id);
                res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/destination');
            }
        });
    });
});

module.exports = router;
