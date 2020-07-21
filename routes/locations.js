const express = require('express');
const router = express.Router();
const db = require('../db');

/* GET locations listing. */
router.get('/', function(req, res, next) {
  db.get().collection("locations").find()
  .toArray()
  .then(items => res.send(items))
  .catch(next)
});

/* POST a new location */
router.post('/', function(req, res, next) {
  let inObj = req.body;
  let dbObj = { date: inObj.date, lat: inObj.lat, lon: inObj.lon, acc: inObj.acc };
  db.get().collection("locations").insertOne(dbObj)
  .then(() => res.send("Location saved"))
  .catch(next);
});

module.exports = router;
