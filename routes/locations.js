const express = require('express');
const router = express.Router();
const db = require('../db');
const defined = o => typeof o !== "undefined";

/* GET locations listing. */
router.get('/', function(req, res, next) {
  db.get().collection("locations").find(parseQuery(req.query))
  .toArray()
  .then(items => defined(req.query.geojson) ? mapToGeoJSON(items) : items)
  .then(data => res.send(data))
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

function mapToGeoJSON(points) {
  points = points.map(point => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          point.lon, point.lat
        ]
      },
      properties: (p => { delete p._id; delete p.lat; delete p.lon; return p })(point),
    }
  });
  return { type: "FeatureCollection", features: points };
}

function verifyToken(authorization) {
  if (!authorization) return false;
  let bearer = authorization.split(' ');
  let token = bearer[1];
  // Lazy authorization, please don't judge
  return token == process.env.ACCESS_TOKEN;
}

function parseQuery(params) {
  let query = {};
  if (defined(params.before) || defined(params.after)) {
    query.fix_time = {};
    if (defined(params.before))
      query.fix_time.$lt = +params.before;
    if (defined(params.after))
      query.fix_time.$gt = +params.after;
  }

  if (defined(params.acc))
    query.acc = { $lte: +params.acc };

  console.log(query);
  return query;
}

module.exports = router;
