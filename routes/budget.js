var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});

function insertingBudgetMin(db,o_id,budget,result){
    budget_min = Math.min.apply(null,budget);

    if (budget_min != result.budgetMin) {

        db.collection("planiz").update({"_id": o_id}, {$set: {budgetMin: budget_min}}, function (err, added) {
            if (err || !added) {
                console.log("BugetMin not added.");
                callback(null, added);
            }
            else {
                console.log("BudgetMin" + budget_min + "added to " + o_id);
            }
        });
    }
    else {
        console.log("The BudgetMin hasn't changed");
    }
}

function gettingBudget(result) {
    var users = result.users;
    var budget = [];
    for (var i = 0; i < users.length; i++) {
        budget[i] = users[i].budget;
    }
    return budget;

}

function addingBudgetMin(db,o_id){
    db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
        if (err) {
            console.error('Find failed', err);
        }
        else {
            var budget = gettingBudget(result);
        }
        insertingBudgetMin(db,o_id,budget,result);
    });
}


/* connexion à la bdd pour les pages spécifiques à 1 planiz*/
MongoClient.connect("mongodb://localhost/bdd_planiz", function(err, db) {
    if (err) return funcCallback(err);



    /* GET budget page for planiz_id */
    router.get('/:planiz_id/:user_id/budget', function (req, res) {
        var o_id = new mongo.ObjectID(req.params.planiz_id);
        db.collection("planiz").findOne({"_id": o_id}, function (err, result) {
            if (err) {
                console.error('Find failed', err);
            } else {
                var users = result.users;
                var budget = [];
                for (var i = 0; i < users.length; i++){
                    // look for the entry with a matching `user_id` value
                    if (users[i].id == req.params.user_id){
                        // define the session variable
                        var user = users[i];
                        req.session.userId = users[i].id;

                    }

                }
                }

                res.render('budget', {title:result.title, planiz: result, user:user})

        });
    });

    /* POST new budget option
      * */
    router.post('/:planiz_id/:user_id/addBudget', urlEncodedParser, function (req, res) {
        console.log("Je suis ici et id = "+req.params.planiz_id)
        var o_id = new mongo.ObjectID(req.params.planiz_id);

        db.collection("planiz").update({"_id": o_id, "users.id":req.params.user_id}, { $set: { "users.$.budget" : req.body.newoption }  }, function(err, added) {
            if( err || !added ) {
                console.log("Budget not added.");
                callback(null,added);
            }
            else {
                console.log("Budget"+req.body.newoption+"added to "+o_id);
                addingBudgetMin(db,o_id);
                res.redirect('/'+req.params.planiz_id+'/'+req.params.user_id+'/budget');
            }
        });
    });






});

module.exports = router;