'use strict';
let express = require('express');
let router = express.Router();
// 'debug'モジュール呼び出し
const debug = require('debug');
// デバッガーを作成する
const photoJs_debugger = debug('debug:photos.js');

// パラメータなしのGETアクセスが送られてきた場合に行う処理
router.get('/', (req, res, next) => {
  photoJs_debugger('GET処理（パラメーターなし）開始');
  res.send('Some photos');
  photoJs_debugger('GET処理（パラメーターなし）完了');
});

router.param('title', (req, res, next, title) => {
  photoJs_debugger('param処理開始');
  res.send(title);
  photoJs_debugger('param処理開始');
  // router.get()関数（パラメータあり）に処理が渡るようだ
  next();
});

router.get('/:title', (req, res, next) => {
  photoJs_debugger('GET処理（パラメーターあり）開始');
  res.end();
  photoJs_debugger('GET処理（パラメーターあり）完了');
});




module.exports = router;
