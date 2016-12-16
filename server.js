var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var RECIPES_COLLECTION = "recipes";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// RECIPES API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/recipes"
 *    GET: finds all recipes
 *    POST: creates a new recipe
 */

app.get("/recipes", function(req, res) {
  db.collection(RECIPES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get recipes.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/recipes", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(RECIPES_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new recipe.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/recipes/:id"
 *    GET: find recipe by id
 *    PUT: update recipe by id
 *    DELETE: deletes recipe by id
 */

app.get("/recipes/:id", function(req, res) {
  db.collection(RECIPES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get recipe");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/recipes/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(RECIPES_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update recipe");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/recipes/:id", function(req, res) {
  db.collection(RECIPES_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete recipe");
    } else {
      res.status(204).end();
    }
  });
});
