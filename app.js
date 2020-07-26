const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// view engine setup
app.engine('ejs', require('express-ejs-extend'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 100 * 1000 }
}));
app.use(flash());

const authCheck = function(req, res, next) {
  if(req.session.uid === process.env.TEST_USER_UID || req.session.uid === process.env.USER_UID) {
    return next();
  }
  req.flash('errors', '您沒有權限進去後端')
  return res.redirect('/auth/login')
}
// const loginCheck = function(req, res, next) {
//   if(req.session.uid === process.env.TEST_USER_UID || req.session.uid === process.env.USER_UID) {
//     return res.redirect('/dashboard/archives');
//   }
//   return next();
// }
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/dashboard', authCheck, dashboardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
