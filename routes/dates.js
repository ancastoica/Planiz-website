var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});


/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);

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
                    }
                }

                var events = [];
                for (var i = 0; i < users.length; i++) {
                    if (users[i].availabilities) {
                        for (var j = 0; j < users[i].availabilities.length; j++) {
                            var newEvent = {
                                title: users[i].name,
                                start: users[i].availabilities[j].start,
                                end: users[i].availabilities[j].end
                            }
                            events.push(newEvent);
                        }
                    }
                }
                console.log(events);
                res.render('dates', {title:result.title, planiz: result, user:user, events: events})
            }
        });
    });

    router.post('/:planiz_id/:user_id/addEvent', function (req, res) {
        var event = JSON.stringify(req.body);
        var eventJ = JSON.parse(event);
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        console.log(req.params.user_id);
        console.log(event);
        db.collection("planiz").update({"_id": o_id, "users.id":req.params.user_id}, { $push: { "users.$.availabilities": eventJ  } }, function(err, added) {
            if (err || !added) {
                console.log("User not added.");
                callback(null, added);
            } else{
                console.log("added successfully");
            }
        });
    });

});

module.exports = router;