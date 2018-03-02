// 厳格モード
'use strict';
// 'debug'モジュール呼び出し
const debug = require('debug');
// デバッガーを作成する
const debugInfo = debug('debug:users.js');
debugInfo('users.js実行');
// expressモジュール読み込み
var express = require('express');
// ルーター生成
var router = express.Router();

/**
 * GETリクエスト時に実行する関数
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const get_func = function (req, res, next) {
  debugInfo('GET処理開始');
  // レスポンスを書き出す。
  // send 関数は、文字列が渡されると自動的にその内容をレスポンスのボディの値とする
  res.send('respond with a resource');
  debugInfo('GET処理完了');
}

/* GET users listing. */
/**
 * GETリクエストに対するルーティング
 * 第一引数：app.use 関数で登録される際のパス以下のパス？
 * 第二引数：実行する処理の関数
 */
router.get('/', get_func);

module.exports = router;
debugInfo('usersモジュール読み込み完了');
