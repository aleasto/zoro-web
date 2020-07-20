var express = require('express');
var router = express.Router();

let db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.MONGODB_URI)
.then(client => db = client.db("zorodb"))
.catch(err => {
  console.error(err);
  process.exit(1);
});

/* GET locations listing. */
router.get('/', function(req, res, next) {
  db.collection("locations").find()
  .toArray()
  .then(items => res.status(200).send(items))
  .catch(next)
});

/* POST a new location */
router.post('/', function(req, res, next) {
  let inObj = req.body;
  let dbObj = { date: inObj.date, lat: inObj.lat, lon: inObj.lon, acc: inObj.acc };
  db.collection("locations").insertOne(dbObj)
  .then(() => res.status(200).send("Location saved"))
  .catch(next);
});

module.exports = router;
