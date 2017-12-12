var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});

const uuidv1 = require('uuid/v1');


/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);

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

    /* GET login page for planiz_id */
    router.get('/:planiz_id/login', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                if(result)
                    res.render('login', {title:result.title, planiz: result})
            }
        });
    });

});

module.exports = router;