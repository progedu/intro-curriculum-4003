var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user });      //req.user というオブジェクトにユーザー情報が含まれているので、それをそのまま、テンプレートの user というプロパティに含めるように変更
});

module.exports = router;
