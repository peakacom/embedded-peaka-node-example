var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const cors = require('cors');
require('dotenv').config()

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
};

var app = express();

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  console.log("dynamic")
  const dynamicDomain = req.headers['origin'] || 'https://defaultdomain.com';
  const cspHeader = `default-src 'self'; script-src 'self' ${dynamicDomain}; frame-ancestors 'self';`.trim();
  
  res.setHeader('Content-Security-Policy', cspHeader);
  
  next();
});

app.use('/', indexRouter);




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
  res.send(JSON.stringify(err));
});

module.exports = app;
