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
  if (!verifyToken(req.headers['authorization'])) {
    res.status(403).send("Invalid access token");
    return;
  }
  
  let inObj = req.body;
  let dbObj = { 
    report_time: new Date().getTime(),
    fix_time: inObj.time,
    lat: inObj.lat,
    lon: inObj.lon,
    alt: inObj.alt,
    acc: inObj.acc,
    bat: inObj.bat,
    net: inObj.net,
  };
  db.get().collection("locations").insertOne(dbObj)
  .then(() => res.send("Location saved"))
  .catch(next);
});

function verifyToken(authorization) {
  if (!authorization) return false;
  let bearer = authorization.split(' ');
  let token = bearer[1];
  // Lazy authorization, please don't judge
  return token == process.env.ACCESS_TOKEN;
}
module.exports = router;
