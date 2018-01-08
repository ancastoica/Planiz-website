var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});


/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);

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

    /* POST new destination option
      * */
    router.post('/:planiz_id/:user_id/addDestination', urlEncodedParser, function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").update({"_id": o_id}, { $push: { destinations: req.body.newoption } }, function(err, added) {
            if( err || !added ) {
                callback(null,added);
            }
            else {
                res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/destination');
            }
        });
    });

    /* POST destination votes
    * * */
    router.post('/:planiz_id/:user_id/addDestinationVote', urlEncodedParser, function (req, res) {
        console.log("Je suis ici et id = "+req.params.planiz_id)
        var event = JSON.stringify(req.body);
        var eventJ = JSON.parse(event);
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").update({"_id": o_id, "users.id":req.params.user_id}, { $push: { "users.$.destinations": Object.keys(eventJ)[0]  } }, function(err, added) {
            if( err || !added ) {
                console.log("Destination not added.");
                callback(null,added);
            }
            else {
                console.log("Destination added to "+o_id);
                res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/destination');
            }
        });
    });


    /* POST pour enlever une destination si l'user a changé d'avis
    * * */
    router.post('/:planiz_id/:user_id/removeDestinationVote', urlEncodedParser, function (req, res) {
        var event = JSON.stringify(req.body);
        var eventJ = JSON.parse(event);
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").update({"_id": o_id, "users.id":req.params.user_id}, { $pull: { "users.$.destinations": Object.keys(eventJ)[0]  } }, function(err, added) {
            if( err || !added ) {
                callback(null,added);
            }
            else {
                res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/destination');
            }
        });
    });
});

module.exports = router;