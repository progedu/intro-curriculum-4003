/*** Nodeモジュール読み込み ***/

// 'debug'モジュール呼び出し
const debug = require('debug');
// 'debug:info'という名前のデバッガーを作成する
const debugInfo = debug('debug:app.js');
debugInfo('debug:app.js作成');
debugInfo('app.js実行開始');

// expressモジュール読み込み
var express = require('express');

// pathモジュール読み込み
// (ファイルパスの文字列の解析、操作)
var path = require('path');

// serve-faviconモジュール読み込み
// favicon関連のなにか
var favicon = require('serve-favicon');

// morganモジュールの読み込み
// ログ出力とか
var logger = require('morgan');

// cookie-parserモジュール読み込み
// Cookieの解釈
var cookieParser = require('cookie-parser');

// body-parserモジュール読み込み
// HTTPのリクエストのボディの解釈
var bodyParser = require('body-parser');

// helmetモジュール読み込み
// Expressの脆弱性対策
var helmet = require('helmet');
debugInfo('Nodeモジュール読み込み完了');

/*** 自作モジュール読み込み ***/
// どういうモジュールかはまだあんまりわからない。
// 後日追記。
var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');
debugInfo('自作ルーターモジュール読み込み完了');

/*** passport関連の設定 ***/

// 認証用のpassportモジュール読み込み
var passport = require('passport');
// Expressでセッションを利用するためのモジュール
var session = require('express-session');

// Expressのアプリケーションを作成
var app = express();
debugInfo('Expressオブジェクト作成完了');

// helmetモジュールのリクエストハンドラ
const helmet_reqHandler = helmet();
// をミドルウェアとして登録する
app.use(helmet_reqHandler);
debugInfo('helmetモジュールのハンドラ登録完了');

// GitHub用のpassportのストラテジー取得
var GitHubStrategy = require('passport-github2').Strategy;
// GitHubに登録したアプリのID
var GITHUB_CLIENT_ID = 'bef9fd48a059e3d3e23b';
// GitHubに登録したアプリのパスワード？
var GITHUB_CLIENT_SECRET = '34b464e648e5a241af3fc02aa32495e505109996';
// passportに設定を登録する
passport.use(
  // GitHubStrategyの設定
  new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    // 認証後にリダイレクトするアドレス
    // （?code=xxxxxxx）みたいなクエリが付与される
    callbackURL: 'http://localhost:8000/auth/github/callback'
  },
    // 検証を行う処理
    function (accessToken, refreshToken, profile, verify) {
      debugInfo('ユーザー確認処理開始？');
      // 時間のかかる処理をnextTickにかませることで
      // フリーズしなくなるらしい
      process.nextTick(function () {
        // 第一引数：エラー　第二引数：結果
        // わからん
        return verify(null, profile);
      });
      debugInfo('ユーザー確認処理完了？');
    }
  ));

// ユーザーデータをシリアライズしてセッションに渡す
// 関数を登録する？
passport.serializeUser(function (user, done) {
  debugInfo('ユーザーのシリアライズ開始')
  done(null, user);
  debugInfo('ユーザーのシリアライズ完了')
});

// セッションからユーザーデータをデシリアライズして
// 取得する関数を登録する？
passport.deserializeUser(function (obj, done) {
  debugInfo('ユーザーデータのデシリアライズ開始')
  done(null, obj);
  debugInfo('ユーザーデータのデシリアライズ完了')
});

// sessionモジュールのハンドラを登録する
app.use(
  session({
    // 秘密文字列
    secret: '417cce55dcfcfaeb',
    // セッションをストア？に登録しない
    resave: false,
    // セッションが初期化されてなくてもストアに保存しない
    // ストアを説明しろぼけ
    saveUninitialized: false
  })
);
// passportは初期化してやる必要がある
app.use(passport.initialize());
// これもなんか必要
app.use(passport.session());

// view engine setup

// アプリのパス'/home/vagrant/workspace/express-api'と
// 'views'をつなぐ
// views_path => '/home/vagrant/workspace/express-api/views'
const views_path = path.join(__dirname, 'views');
// アプリケーションの'views'という変数に値を設定する
// ハッシュテーブルみたいにapp.get('views')で呼び出せるようだ
app.set('views', views_path);

// 同上
// view engineとしてjadeを指定する
app.set('view engine', 'jade');
debugInfo('ビューの設定完了');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/** 
 * morganモジュールのリクエストハンドラ
 * 第一引数：ログのフォーマット形式
 * 　　　　　参照：https://github.com/expressjs/morgan
*/
// ログの出力形式を'dev'（開発用）に設定するという処理
const log_reqHandler = logger('dev');
// をミドルウェアとして登録する
app.use(log_reqHandler);
debugInfo('morganモジュール（ログ）のハンドラ登録完了');

// JSON形式のリクエストを解析する？という処理
const jsonBodyParser_reqHandler = bodyParser.json();
// をミドルウェアとして登録する
app.use(jsonBodyParser_reqHandler);

// URLエンコードする際のオプション
// extended: trueならquerystringライブラリを使う。
// 　　　　　 falseならqsライブラリを使う
const urlEncodedOption = { extended: false };
// URLエンコードされたリクエストを解析する？という処理
const urlEncoded_reqHandler = bodyParser.urlencoded(urlEncodedOption);
// をミドルウェアとして登録する
app.use(urlEncoded_reqHandler);
debugInfo('bodyParserモジュールのハンドラ登録完了');

// Cookieを解釈するという処理
const cookieParser_reqHandler = cookieParser();
// をミドルウェアとして登録する
app.use(cookieParser_reqHandler);
debugInfo('cookieParserモジュールのハンドラ登録完了');

// 画像やcssなどの静的ファイルを置いておくディレクトリのパス
const public_path = path.join(__dirname, 'public')
// 静的ファイルへのルーティングを行うという処理
const static_handler = express.static(public_path)
// をミドルウェアとして登録する
app.use(static_handler);
debugInfo('静的ファイルディレクトリ設定完了');

/*** リクエストされたパスとルーターを関連付ける ***/
// '/'というパスにアクセスされたときは
// './routes/index'のルーターを利用してルーティングを行うという処理
// をミドルウェアとして登録する
// （上の方でroutes = require('./routes/index');を
// 　実行している）
app.use('/', routes);
// 
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
app.use('/users', ensureAuthenticated,  users);
// 同上
app.use('/photos', photos);
debugInfo('パスとルーターの関連付け完了');

// /auth/githubにGETアクセスがあったとき、
// passportによるgithubを経由した認証を行う
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
    debugInfo('github認証完了');
  }
);

// シリアライズ処理の時になんか呼ばれてる
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    debugInfo('コールバックからのリダイレクト？')
    res.redirect('/');
  });

// /loginにGETアクセスがあったとき、
// login.jadeを描画する
app.get('/login', function (req, res) {
  res.render('login');
}
);
// /logoutにGETアクセスがあったとき、
// ログアウト処理を行い、/にリダイレクトする
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// catch 404 and forward to error handler
/**
 * Not Foundエラー発生時に実行する処理
 * @param {*} req 
 * @param {*} res 
 * @param {*} next Not Foundエラー発生時に呼び出すCB関数（実行するミドルウェア）
 */
const err404_func = function (req, res, next) {
  debugInfo('404エラー処理開始');
  // エラーを発生させる
  var err = new Error('Not Found');
  // ステータスコード404に設定
  err.status = 404;
  debugInfo('404エラー内NEXT実行');
  // 次のミドルウェアに処理を渡す
  next(err);
  debugInfo('404エラー処理終了');
};
// ここまでに実行したミドルウェアで終了命令が
// 出されなかったときに実行するNOT FOUND処理を
// ミドルウェアとして登録する？
app.use(err404_func);
debugInfo('404エラー処理登録完了');

// error handlers

// development error handler
// will print stacktrace
/**
 * 開発環境でエラーが起こった時に実行する関数
 * @param {*} err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next エラー発生時に実行する関数
 */
const developmentError_func = function (err, req, res, next) {
  debugInfo('development error処理開始');
  // レスポンスにステータスコードを設定。
  // 不明の場合は500 Internal Server Error
  res.status(err.status || 500);
  /**
   * レスポンスを書き出す。
   * 第一引数：jadeファイル名
   * 第二引数：jadeテンプレートに渡す変数情報のオブジェクト
   */
  // errorオブジェクトを書き出すことでスタックトレースが利用できる
  res.render('error', {
    message: err.message,
    error: err
  });
  debugInfo('development error処理完了');
}
// 開発環境の場合のみ
if (app.get('env') === 'development') {
  // developmentError_funcをミドルウェアとして登録する
  app.use(developmentError_func);
  debugInfo('development error処理登録完了')
}

// production error handler
// no stacktraces leaked to user
// ここまでに実行したミドルウェアで終了命令が
// 出されなかったときに実行するエラー処理を
// ミドルウェアとして登録する？
const productionError_func = function (err, req, res, next) {
  debugInfo('本番エラー');
  // レスポンスにステータスコードを設定。
  // 不明の場合は500 Internal Server Error
  res.status(err.status || 500);
  /**
   * レスポンスを書き出す。
   * 第一引数：jadeファイル名
   * 第二引数：jadeテンプレートに渡す変数情報のオブジェクト
   */
  // errorオブジェクトを設定しないことでスタックトレースをユーザーに見せない
  res.render('error', {
    message: err.message,
    error: {}
  });
}
// productionError_funcをミドルウェアとして登録する
app.use(productionError_func);
debugInfo('production error処理登録完了')

module.exports = app;
