var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');

var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;

//実際に公開するアプリケーションで運用する場合にはこれらのトークンは秘匿する必要があるため、
//環境変数から読み出したり、.gitignore に設定されたバージョン管理しないファイルから読み込む。
var GITHUB_CLIENT_ID = 'fe140d1cc08a26230c2d';
var GITHUB_CLIENT_SECRET = '024c6af3e83a14bc6905dfcafeb49e3533a09149';

//パスポートの基本的な使い方
passport.serializeUser(function (user, done) {
  done(null, user);//serializeUser には、ユーザーの情報をデータとして保存する処理
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);// deserializeUser は、保存されたデータをユーザーの情報として読み出す際の処理
});

//時間がかかる処理（データベースへの保存）のせいで他の処理が滞ってしまわないようにするため、他のイベント処理からする。
//nextTick 関数のコールバック関数で 処理を細切れにし、合間にやっていく。ユーザー待たせない。
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var photosRouter = require('./routes/photos');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//express-session と passport でセッションを利用するという設定
// express-session には、 セッション ID を作成されるときに利用される秘密鍵の文字列と、
// セッションを必ずストアに保存しない設定、セッションが初期化されてなくてもストアに保存しないという設定を それぞれしてあります。セキュリティ強化のための設定です。
app.use(session({ secret: '417cce55dcfcfaeb', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', ensureAuthenticated, usersRouter);//ユーザールーターに行く前に認証の有無確認する関数をはさむようにする
app.use('/photos', photosRouter);

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
});

//ログインしたら、ログインパグを出す
app.get('/login', function (req, res) {
  res.render('login');
});
//ログアウトしたら、ログアウトパグ出して、トップに戻る
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// /users は認証が完了していないと見れないようにする
//認証されていない場合には、 /login にリダイレクトする。
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;