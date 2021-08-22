var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var otheruserRouter= require('./routes/expensePersonal')

var adminMod= require('./routes/users')
// var otheruserMod= require('./routes/expensePersonal')
var passport= require('passport')
var expressSession= require('express-session');


var app = express();


// view engine setup

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: 'verry secret'
}))

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(adminMod.serializeUser());
passport.deserializeUser(adminMod.deserializeUser());

// passport.serializeUser(otheruserMod.serializeUser());
// passport.deserializeUser(otheruserMod.deserializeUser());



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/otheruser', otheruserRouter);

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
