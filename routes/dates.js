var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');


/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);

    /*
     * GET dates page
     */
    router.get('/:planiz_id/:user_id/dates', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                var users = result.users;
                var events = [];
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id === req.params.user_id){
                        var user = users[i];
                    }
                    if (users[i].availabilities) {
                        for (var j = 0; j < users[i].availabilities.length; j++) {
                            var newEvent = {
                                title: users[i].name,
                                start: users[i].availabilities[j].start,
                                end: users[i].availabilities[j].end
                            };
                            events.push(newEvent);
                        }
                    }
                }
                res.render('dates', {title:result.title, planiz: result, user:user, events: events})
            }
        });
    });


    /*
     * POST disponibilites selectiones d'un utilisateur
     * rajout dans la bdd
     */
    router.post('/:planiz_id/:user_id/addEvent', function (req, res) {
        var event = JSON.stringify(req.body);
        var eventJ = JSON.parse(event);
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").update({"_id": o_id, "users.id":req.params.user_id}, { $push: { "users.$.availabilities": eventJ  } }, function(err, added) {
            if (err || !added) {
                console.log("Event not added.");
                callback(null, added);
            } else{
                var start = new Date(eventJ.start+"Z");
                var end = new Date(eventJ.end+"Z");
                db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
                    if (err) {
                        console.error('Find failed', err);
                    } else {
                        for (var i = start; i < end; i.setDate(i.getDate() + 1)) {
                            var query = {};
                            var str = "globalAvailabilities." + i.toISOString().substring(0, 10);
                            query[str] = 1;
                            if (result.globalAvailabilities[i.toISOString().substring(0, 10)]) {
                                db.collection("planiz").update({"_id": o_id}, {$inc: query}, function (err, added) {});
                            } else {
                                db.collection("planiz").update({"_id": o_id}, {$set: query}, function (err, added) {});
                            }
                        }
                    }
                    res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/computeBestAvailabilities');
                });
            }
        });
    });

    /*
     * Calcul des meilleures plages de dates
     */
    router.get('/:planiz_id/:user_id/computeBestAvailabilities', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, r) {
            var a = r.globalAvailabilities;
            var keys = Object.keys(a);
            keys.sort();

            var diff2 = 0;
            var best = r.bestAvailabilities;

            for(var d=1; d<=r.users.length;d++){
                //console.log("d: "+d);

                var key = keys[0];
                var previousKey = key;
                var start0 = key;
                var end0 = key;
                var start1 = new Date(start0+"Z");
                var end1 = new Date(end0+"Z");
                var diff1 = (end1-start1)/(1000*60*60*24);

                //console.log("start: "+ start0);

                if(r.bestAvailabilities[""+d]){
                    var start2 = new Date(r.bestAvailabilities[""+d].start+"Z");
                    var end2 = new Date(r.bestAvailabilities[""+d].end+"Z");
                    diff2 = (end2-start2)/(1000*60*60*24);
                } else{
                    diff2 = 0;
                }

                for (var k = 1; k < keys.length; k++) {
                    key = keys[k];


                    var d1 = new Date(key+"Z");
                    var d2 = new Date(previousKey+"Z");
                    var diff = (d1-d2)/(1000*60*60*24);

                    if (d <= a[key] && diff === 1  ) {
                        if(d > a[previousKey]){
                            start0 = key;
                            start1 = new Date(start0+"Z");
                        }
                        end0 = key;
                        //console.log("increased end: "+ end0);
                        end1 = new Date(end0+"Z");

                        diff1 = (end1-start1)/(1000*60*60*24);

                        if(r.bestAvailabilities[""+d] && diff1 > diff2 || !r.bestAvailabilities[""+d]){
                            best[d] = {
                                start: start0,
                                end: end0
                            };
                            db.collection("planiz").update({"_id": o_id}, {$set: {"bestAvailabilities":best}}, function (err, added) {});
                        }
                    } else {
                        start0 = key;
                        end0 = key;
                        start1 = new Date(start0+"Z");
                        end1 = new Date(end0+"Z");
                        //console.log("new period start, end: "+ end0);
                    }
                    previousKey = key;
                }
            }
        });
        res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/dates');
    });

});

module.exports = router;