// 厳格モード
'use strict';
// 'debug'モジュール呼び出し
const debug = require('debug');
// デバッガーを作成する
const debugInfo = debug('debug:photos.js');
debugInfo('photos.js実行');
// expressモジュール読み込み
const express = require('express');
// ルーター生成
const router = express.Router();

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
    res.send('Some photos');
    debugInfo('GET処理完了');
}

/**
 * GETリクエストに対するルーティング
 * 第一引数：app.use 関数で登録される際のパス以下のパス？
 * 第二引数：実行する処理の関数
 */
router.get('/', get_func);
/**
 * アクセスされたURLにパラメーターが
 * 指定されていた場合に実行する関数
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} title 
 * @param {*} name 
 */
const param_func = function (req, res, next, title, name) {
    debugInfo('PARAM処理開始');
    res.send(title);
    debugInfo('PARAM内NEXT()');
    // 次のミドルウェアに処理を渡す
    // next()は単なるCB関数（仮引数）の名前であることに注意
    next();
    debugInfo('PARAM処理完了');
};

/**
 * アクセスされたURLにパラメーターが指定されていた場合のルーティング
 * 第一引数：値を代入するパラメーター名
 * 第二引数：実行する処理のCB関数
 * 　　CB関数の第一引数：incomingMessage
 * 　　CB関数の第二引数：serverResponse
 * 　　CB関数の第三引数：CB関数のなかでさらに実行されるCB関数
 * 　　CB関数の第四引数：パラメーター値
 * 　　CB関数の第五引数：パラメーター名
 */
// http://localhost:8000/photos/hogeにアクセスされると
// param()が呼び出される
// 'id'というパラメータに'hoge'がセットされる
// param_funcの引数nextにはパラメータつきの
// get関数を呼び出すような関数が指定されているようだ
// つまり処理の順番としては
//
// param()に入る　→
// param()の引数のCB関数param_func()に入る　→
// param_func()の引数のCB関数を経由してget('/:id')に入る　→
// get('/:id')の引数のCB関数getId_func()に入る　→
// getId_func()出る　→　get('/:id')出る　→
// param_func()の引数のCB関数出る　→　param_func()出る　→
// param()出る　→　おわり。
//
// かな？
router.param('title', param_func);
/**
 * パラメーターつきのGETリクエストが送られてきた時に
 * param()関数を経由して呼び出されるGET関数
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getId_func = function (req, res, next) {
    debugInfo('GET:ID処理開始');
    res.end();
    debugInfo('GET:ID処理完了');
}
router.get('/:title', getId_func);

module.exports = router;
debugInfo('photosモジュール読み込み完了');
