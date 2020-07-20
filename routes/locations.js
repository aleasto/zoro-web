var express = require('express');
var router = express.Router();

/* GET locations listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res) {
  console.log(req.body);
  res.status(200).send("Gotcha");
});

module.exports = router;
