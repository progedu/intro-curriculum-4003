var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');

//モジュールを読み込む
var session = require('express-session');     //理解できた＝セッションを維持するためのもの
var passport = require('passport');     //理解できた＝パスポートは、オース（認証本部）の基盤みたいなもの


//var GitHubStrategy = require('passport-github2').Strategy;
var passportGithub2 = require('passport-github2');  var GitHubStrategy = passportGithub2.Strategy
//前まで使っていたスタイルに書き換えてみました。（なお、関数名にマイナスが入ると計算しちゃうので、キャメル形式を採用しました）
//なんだコレ？？？？？？？？？   //モジュール自体は、ギットハブは、パスポートをギットハブに適応させるものだが、ストラテジ（戦略）を、この表現にするのが初体験なので調べましょう！！！
//clientIDとclientSecretと,callbackURLの３つは用意しておくことになっている。 //テキストに書いてあるＵＲＬ先で公式（Passport-GitHub2）のを読めば、このモジュールの使い方のサンプルがあるので、そちらを参照！！
//ここのところで、今まで通りに書いてみると、 var passport-github2 = require('passport-github2');  var GitHubStrategy = passport-github2.Strategy  　で動くかどうか、実験してみたい。！！！

//GitHub で準備しておいたトークンを定数として登録
var GITHUB_CLIENT_ID = '90d1f8bc7a717541e85b';
var GITHUB_CLIENT_SECRET = '10f61df0d616f4ee70a43a8170f4e470dc83f8be';
//  GITHUB_CLIENT_IDとGITHUB_CLIENT_SECRETは、自前のものに交換しました。

//パスポートの使い方は、http://knimon-software.github.io/www.passportjs.org/guide/ node.js用認証モジュール Passport（日本語版:非公式）が、日本語で書いてあるので、そちらを俯瞰してから、英語のほうで細部を確認しよう。
//バイナリ情報として保存？？？

//公式？　https://github.com/cfsghost/passport-github/blob/master/examples/login/app.js   のサンプルのコメント

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.

passport.serializeUser(function (user, done) {
  done(null, user);     //ダーン関数の、１番目の引数はエラーだった時のため。第２引数は、結果？？？？？？
});
//（引用）「ユーザオブジェクトを与えてやるから，保存に成功したらdoneの第2引数ででユーザIーを渡してくれ．エラーがあったときは第1引数にそれを渡してくれ．続く処理は俺(Passport)がやるからとりあえずその仕事だけよろしく．」 

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
//（引用）
//上の２つのシリアライズと、デシリアライズの部分は、セッションを管理しているらしい。
//多分、こいつを見れば、ドンピシャリと解決しそう！！！    https://teratail.com/questions/50461



// ここも公式らしきサイトのサンプルのコメントを貼り付け
// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {           //実際に認証する処理らしい？？？？
    process.nextTick(function () {                              //ネクスティックは、ループした時に待機？？？？？
      return done(null, profile);
    });
  }
  ));

//  ここまでで、パスポートの導入（設定）が済んだような気がする
//  done関数、process.nextTick 関数  等などは、コールバック　や　非同期　といった、核心的な部分を理解しなければならない。（逆に言えば、今回の学習で、その辺りを少し理解できる良い機会でもある。）



var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// configure Express
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(session({ secret: '417cce55dcfcfaeb', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', ensureAuthenticated, users);
app.use('/photos', photos);


// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
  });


// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });

//    以下は、/login に GET でアクセスがあった時に、 login.jade というテンプレートがあることを前提にログインページを描画するコード
app.get('/login', function (req, res) {
  res.render('login', { user: req.user });
});

//    以下のコードは、/logout に GET でアクセスがあった時にログアウトを実施し、 / のドキュメントルートにリダイレクトさせる
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
