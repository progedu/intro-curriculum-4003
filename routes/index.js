// 'debug'モジュール呼び出し
const debug = require('debug');
// デバッガーを作成する
const debugInfo = debug('debug:index.js');
debugInfo('index.js実行');
// expressモジュール読み込み
var express = require('express');
// ルーター生成
var router = express.Router();

/* GET home page. */
/**
 * GETリクエスト時に実行する関数
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const get_func = function (req, res, next) {
  debugInfo('GET処理開始');
  /**
   * レスポンスを書き出す。
   * 第一引数：jadeファイル名
   * 第二引数：jadeテンプレートに渡す変数情報のオブジェクト
   */
  res.render('index', { title: 'Express', user: req.user });
  debugInfo('GET処理終了');
}
/**
 * GETリクエストに対するルーティング
 * 第一引数：app.use 関数で登録される際のパス以下のパス？
 * 第二引数：実行する処理の関数
 */
router.get('/', get_func);

module.exports = router;
debugInfo('indexモジュール読み込み完了');
