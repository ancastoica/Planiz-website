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



});

module.exports = router;