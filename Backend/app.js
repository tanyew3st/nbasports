var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var cors = require('cors')
app.use(cors({ credentials: true, origin: ['http://localhost:8000', 'http://localhost:3000'] }));



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/winbet', indexRouter);
app.use('/upsetteam', indexRouter);
app.use('/standings', indexRouter);
app.use('/winafterloss', indexRouter);
app.use('/favored', indexRouter);
app.use('/unfavored', indexRouter);
app.use('/pointstreak', indexRouter);
app.use('/carryingteam', indexRouter);
app.use('/consistentplayers', indexRouter);
app.use('/stealsandpoints', indexRouter);
app.use('/ifbetplayer', indexRouter);
app.use('/ifbethome', indexRouter);
app.use('/ifbetaway', indexRouter);
app.use('/teamnames', indexRouter);
app.use('/onload', indexRouter);
app.use('/playersonteam', indexRouter);
app.use('/zigzag', indexRouter);
app.use('/heavyfavorite', indexRouter);
app.use('/winstreak', indexRouter);
app.use('/losingstreak', indexRouter);
app.use('/likedteam', indexRouter);
app.use('/homerecovery', indexRouter);
app.use('/adduser', indexRouter);
app.use('/login', indexRouter);
app.use('/savequery', indexRouter);
app.use('/getqueries', indexRouter);


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

app.listen("3000", () => {
  console.log(`TANAY!`);
});


module.exports = app;
