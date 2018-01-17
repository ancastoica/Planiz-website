var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');


/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);

    /*
     * GET dates page for planiz_id
     * Variables renvoyes:
     * planiz: planiz courant
     * user: utilisateur courant
     * events: disponibilites presentes dans la bdd
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
                        for (var date = start; date < end; date.setDate(date.getDate() + 1)) {
                            var query = {};
                            var str = "globalAvailabilities." + date.toISOString().substring(0, 10);
                            console.log("Voici l'id de l'utilisateur :" + req.params.user_id);
                            query[str] = req.params.user_id;
                            db.collection("planiz").update({"_id": o_id}, {$push: query}, function (err, added) {
                                if (err || !added) {
                                    console.log("Event not added.");
                                    callback(null, added);
                                }
                            });
                        }

                        if(result.usersFilledIn.indexOf(req.params.user_id) >=0){
                            console.log('This user has already filled in his planiz');
                        }
                        else{
                            db.collection("planiz").update({"_id": o_id}, { $push: {usersFilledIn : req.params.user_id}}, function(err, added) {});

                        }



                    }
                    res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/computeBestAvailabilities');
                });
            }
        });
    });

    router.get('/:planiz_id/:user_id/computeBestAvailabilities', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        var existingDifference = 0;



        db.collection("planiz").findOne({"_id": o_id}, function (err, planiz) {
            var best = planiz.bestAvailabilities;
            var globalAvailabilities = planiz.globalAvailabilities;
            var allDatesChosen = Object.keys(globalAvailabilities);

            allDatesChosen.sort();


            var nbTotalOfUsers = planiz.usersFilledIn.length;
            console.log("Je commence le calcul !!!");
            for(var nbOfPersonsAvailable=1; nbOfPersonsAvailable<=nbTotalOfUsers;nbOfPersonsAvailable++){
                console.log("Calcul pour " + nbOfPersonsAvailable + " personne");

                var currentDate = allDatesChosen[0];
                var previousDate = currentDate;
                var startInString = currentDate;
                var endInString = currentDate;
                var startAsDate = new Date(startInString+"Z"); // Conversion from string to date
                var endAsDate = new Date(endInString+"Z");
                var newDifferenceComputed = 0;
                var counter = 0;

                // For the coming update : Check if there is already a range in the database to update
                if(planiz.bestAvailabilities[""+nbOfPersonsAvailable]){
                    startAsDate = new Date(planiz.bestAvailabilities[""+nbOfPersonsAvailable].start+"Z");
                    endAsDate = new Date(planiz.bestAvailabilities[""+nbOfPersonsAvailable].end+"Z");
                    existingDifference = (endAsDate-startAsDate)/(1000*60*60*24);
                } else{
                    console.log("Il n'y a rien pour l'instant");
                    existingDifference = 0;
                }



                for (var date = 1; date < allDatesChosen.length; date++) {
                    currentDate = allDatesChosen[date];

                    var currentDateAsDate = new Date(currentDate+"Z");
                    var previousDateAsDate = new Date(previousDate+"Z");
                    console.log("La date précedente est " + previousDate);
                    console.log("La date actuelle est " + currentDate);


                    counter = 0;
                    globalAvailabilities[currentDate].forEach(function(element){
                        if (globalAvailabilities[previousDate].indexOf(element) >= 0){
                            counter++;
                        }
                    });
                    console.log("Si on compare le " + currentDate + "à " + previousDate + " ,on observe un coompteur égal à " +counter);

                    var diffBetweenCurrentPrevious = (currentDateAsDate-previousDateAsDate)/(1000*60*60*24);
                    console.log(("La différence entre les deux dates est " + diffBetweenCurrentPrevious));
                    if (nbOfPersonsAvailable <= counter && diffBetweenCurrentPrevious === 1  ) {
                        console.log("Bingo !")
                        endInString = currentDate;
                        endAsDate = new Date(endInString+"Z");
                    } else {
                        console.log("Et non, on passe à la date suivante")
                        startInString = currentDate;
                        endInString = currentDate;
                        startAsDate = new Date(startInString+"Z");
                        endAsDate = new Date(endInString+"Z");
                    }


                    newDifferenceComputed = (endAsDate-startAsDate)/(1000*60*60*24);
                    console.log(("La nouvelle différence calculée est donc "+ newDifferenceComputed));

                    if(planiz.bestAvailabilities[""+nbOfPersonsAvailable] && newDifferenceComputed > existingDifference || !planiz.bestAvailabilities[""+nbOfPersonsAvailable] && newDifferenceComputed !== 0){
                        console.log("On rajoute bien notre nouvelle plage");
                        best[nbOfPersonsAvailable] = {
                            start: startInString,
                            end: endInString
                        };
                        db.collection("planiz").update({"_id": o_id}, {$set: {"bestAvailabilities":best}}, function (err, added) {});
                    }
                    previousDate = currentDate;
                }

            }

        });
        res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/dates');
    });

});

module.exports = router;