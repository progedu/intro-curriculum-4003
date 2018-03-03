// 'debug'モジュール呼び出し
const debug = require('debug');
// デバッガーを作成する
const indexJs_debugger = debug('debug:index.js');

var express = require('express');
var router = express.Router();
indexJs_debugger('index.js開始');

/* GET home page. */
// GETアクセスが送られてきた場合の処理
router.get('/', function (req, res, next) {
  indexJs_debugger('GET処理');
  res.render(
    'index',
    {
      title: 'Express',
      user: req.user
    }
  );
});

module.exports = router;
