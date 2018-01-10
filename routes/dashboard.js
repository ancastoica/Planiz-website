var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');


/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);

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
                        if (users[i].id === req.params.user_id) {
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

});

module.exports = router;