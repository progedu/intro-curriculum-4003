// 'debug'モジュール呼び出し
const debug = require('debug');
// デバッガーを作成する
const appJs_debugger = debug('debug:app.js');
appJs_debugger('app.js処理開始');

// 必要なモジュールを読み込む
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
// passport-github2モジュールから
// passportを利用するのに必要なGitHubStrategyを取得する
var GitHubStrategy = require('passport-github2').Strategy;
// GitHubStrategyのコンストラクタに必要な
// GitHubに登録したアプリの情報
var GITHUB_CLIENT_ID = 'bef9fd48a059e3d3e23b';
var GITHUB_CLIENT_SECRET = '34b464e648e5a241af3fc02aa32495e505109996';
var GITHUB_CALLBACK_URL = 'http://localhost:8000/auth/github/callback'

// passportにユーザーデータをシリアライズする処理を登録する
passport.serializeUser(function (user, done) {
  appJs_debugger('ユーザーデータのシリアライズ処理開始');
  done(null, user);
  appJs_debugger('ユーザーデータのシリアライズ処理完了');
});

// passportにユーザーデータをデシリアライズする処理を登録する
passport.deserializeUser(function (obj, done) {
  appJs_debugger('ユーザーデータのデシリアライズ処理開始');
  done(null, obj);
  appJs_debugger('ユーザーデータのデシリアライズ処理完了');
});

// passportの設定
// GitHubを利用して認証を行う場合は
// 引数にGitHubStrategyオブジェクトを指定する
passport.use(
  new GitHubStrategy(
    {
      //GitHubに登録したアプリの情報を設定する
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

// ルーターを読み込む
var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');
// Expressアプリケーション作成
var app = express();
// helmetモジュールのハンドラを登録する
app.use(helmet());

// view engine setup
// 'views'というアプリ内変数に{アプリのディレクトリ}/viewsという文字列を登録する
// 今のところなくても正常に動くのでコメントアウトしている
// app.set('views', path.join(__dirname, 'views'));
// 'view engine'というアプリ変数に'jade'という文字列を登録する
// これを指定しないとrender()が利用できない
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// loggerモジュールのハンドラを登録する。出力形式に開発用を指定。
app.use(logger('dev'));
// 今のところなくても正常に動くのでコメントアウトしている
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// sessionの初期化を行う
// （ユーザーデータを保存するためにセッション機能を利用する必要がある）
app.use(session(
  {
    // Cookieの暗号化に利用するキー（必須）
    secret: '417cce55dcfcfaeb',
    // 今のところ違いがあんまりわからないが
    // falseにしとくほうがいいらしい
    // https://qiita.com/moomooya/items/00f89e425a3034b8ea14
    resave: false,
    saveUninitialized: false
  }
));
// passportの初期化を行う
app.use(passport.initialize());
// passportにsession機能をひもづける
app.use(passport.session());

// URLのアクセスを各ルーターにまわす
// 各ルーターのGET処理からはnext()が発行されないので
// 各ルーターでget()が実行されると処理が終了する
app.use('/', routes);
// app.use('/users', users);
app.use('/photos', photos);

// 特定の条件を満たしたときだけルーターに処理を渡す方法
app.use('/users',
  function (req, res, next) {
    // 認証（ログイン）済のときだけ、
    // usersルーターに処理を回している
    if (req.isAuthenticated()) {
      return next();
    }
    // ログインしていないならnext()が発行されない
    res.redirect('/login');
  },
  users
);

// /auth/githubにGETでアクセスされた時に
// passportを使用した認証処理を行う
app.get('/auth/github',
  function (req, res, next) {
    appJs_debugger('認証画面表示');
    // こういう場所にもnext()が必要
    next();
  },
  // ユーザーにアプリのGitHub認証を許可するか確認する画面が表示される
  // scopeは利用を許可してもらうデータ
  // ユーザーが認証を許可すると
  // {GITHUB_CALLBACK_URL}?code=xxxxxxxxxxxxxxx
  // のURLへリダイレクトされる
  passport.authenticate(
    'github', { scope: ['user:email'] }),
  function (req, res, next) {
    appJs_debugger('passport.authenticate()完了');
  }
);

// ユーザーが認証許可の操作をするとリダイレクトされるURL
app.get('/auth/github/callback',
  function (req, res, next) {
    appJs_debugger('ユーザーが認証許可をしました');
    next();
  },
  // おそらくここで実際の認証（ログイン）処理が行われているっぽい
  // 失敗した場合は/loginへリダイレクト
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    appJs_debugger('ユーザーを検証しました？');
    res.redirect('/');
  }
);

// /loginにGETでアクセスされた時にログイン画面を表示する処理
app.get('/login', function (req, res) {
  res.render('login');
});

// /logoutにGETでアクセスされた時にログアウトをする処理
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// catch 404 and forward to error handler
// 関数を記述してミドルウェアっぽく登録することもできる。
// 各ルーターでリクエストが拾われなかった場合のエラー処理
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// 開発環境の場合のみスタックトレースを表示させるハンドラを表示する
if (app.get('env') === 'development') {
  // エラー用のハンドラは第一引数にエラーオブジェクトをとる
  // next()関数を発行していないので、開発環境の場合はここでエラー処理が終了する
  app.use(function (err, req, res, next) {
    // ステータスコード500はInternal Server Error
    res.status(err.status || 500);
    // render()の第一引数にはjadeのファイル名を指定する
    // 第二引数はjadeファイルに渡すパラメータ情報
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
// 開発環境以外の場合のみ実行されるエラー処理
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
