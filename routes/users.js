var express = require('express');
var router = express.Router();

/* GET users listing. */
// GETアクセスが送られてきた場合の処理
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
