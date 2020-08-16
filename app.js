require("dotenv").config();
var express = require('express');
var session = require("express-session");
var fileStore = require("session-file-store")(session);
var path = require('path');
const bodyParser = require("body-parser");
var passport = require("passport");
// var authenticate = require("./authenticate");
var tweetRouter = require('./routes/tweetRouter');
var usersRouter = require('./routes/users');
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
const ejs = require("ejs")
var createError = require('http-errors');


const mongoose =require("mongoose");
const Tweets=require("./models/tweets");
const connect = mongoose.connect("mongodb://localhost:27017/TwitterDB",{ useNewUrlParser: true , useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
connect.then((db)=>{
  console.log("Connected correctly to server");
},(err)=>{console.log(err); });




//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/tweets',tweetRouter);
app.use('/users', usersRouter);

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));


app.listen(3000,()=>{
  console.log("Connected Correctly On Port 3000");
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
