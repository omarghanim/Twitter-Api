const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
// var authenticate = require('../authenticate');
const Tweets = require("../models/tweets");
const tweetRouter = express.Router();
var users = require("./users")

tweetRouter.use(bodyParser.json());

tweetRouter.route("/")
.get(function(req,res,next){
  if(req.isAuthenticated){
  Tweets.find({})
  .populate("comments.author")
  .then((tweets)=>{
      res.statusCode=200;
      res.setHeader("Content-Type","application/json")
      res.json(tweets);
  },(err)=>next(err))
  .catch((err)=>next(err));
}
})
.post(function(req,res,next){
Tweets.create(req.body)
.then((tweet)=>{
      console.log("Tweet Created", tweet);
      res.statusCode=200;
      res.setHeader("Content-Type","application/json")
      res.send(tweet);
},(err)=>next(err))
.catch((err)=>next(err));
})

.put(function(req,res,next){
  res.statusCode = 403 ;
  res.end('PUT operation not supported on /tweets');
})
.delete(function(req,res,next){
  Tweets.remove({})
  .then((resp)=>{
    res.statusCode=200;
    res.setHeader("Content-Type","application/json")
    res.json(resp)
  },(err)=>next(err))
  .catch((err)=>next(err));
});

//tweetId

tweetRouter.route("/:tweetId")
.get((req,res,next) => {
  Tweets.findById(req.params.tweetId)
    .populate("comments.author")
  .then((tweet)=>{
    res.statusCode=200;
    res.setHeader("Content-Type","application/json");
    res.json(tweet);
  },(err)=>next(err))
  .catch((err)=>next(err));
})



.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /tweets/'+ req.params.tweetId)
})

.put((req, res, next) => {
  Tweets.findByIdAndUpdate(req.params.tweetId, {$set : req.body},{new:true})
  .then((tweet)=>{
    res.statusCode=200;
    res.setHeader("Content-Type","application/json")
    res.json(tweet)
  },(err)=>next(err))
  .catch((err)=>next(err));
})

.delete((req, res, next) => {
  Tweets.findByIdAndRemove(req.params.tweetId)
  .then((respo)=>{
    res.statusCode=200;
    res.setHeader("Content-Type","application/json")
    res.json(respo)
  },(err)=>next(err))
  .catch((err)=>next(err));
});

//comments
tweetRouter.route("/:tweetId/comments")
.get((req,res,next) => {
  Tweets.findById(req.params.tweetId)
    .populate("comments.author")
  .then((tweet)=>{
    if(tweet != null){
      res.statusCode=200;
      res.setHeader("Content-Type","application/json");
      res.json(tweet.comments);
    }
    else{
    err=new Error("Tweet" + req.params.tweetId+"not found");
    err.status=400;
    return next(err);
    }

  },(err)=>next(err))
  .catch((err)=>next(err));
})

.post((req, res, next) => {
  Tweets.findById(req.params.tweetId)
    .then((tweet)=>{
      if(tweet != null){
        tweet.comments.push(req.body)
        tweet.save()
            res.statusCode=200;
            res.setHeader("Content-Type","application/json");
            res.json(tweet);

      }
      else{
        err=new Error("Tweet" + req.params.tweetId+"not found");
        err.status=400;
        return next(err);
      }

  },(err)=>next(err))
  .catch((err)=>next(err));
})

.put((req, res, next) => {
res.statusCode=403;
res.end('POST operation not supported on /tweets/'+ req.params.tweetId+"/comments");
})

.delete((req, res, next) => {
  Tweets.findById(req.params.tweetId)
  .then((tweet)=>{
    if(tweet != null){
      for (var i = (tweet.comments.length-1) ; i>=0 ; i--){
        tweet.comments.id(tweet.comments[i]._id).remove();
      }
      tweet.save()
      .then((tweet)=>{
        res.statusCode=200;
        res.setHeader("Content-Type","application/json")
        res.json(tweet);
      },(err)=>next(err));
    } else{
      err=new Error("Tweet" + req.params.tweetId+"not found");
      err.status=400;
      return next(err);
    }
},(err)=>next(err))
.catch((err)=>next(err));
});

//commentsId

tweetRouter.route("/:tweetId/comments/:commentId")
.get((req,res,next) => {
  Tweets.findById(req.params.tweetId)
    .populate("comments.author")
  .then((tweet)=>{
    if(tweet != null && tweet.comments.id(req.params.commentId) != null){
      res.statusCode=200;
      res.setHeader("Content-Type","application/json")
      res.json(tweet.comments.id(req.params.commentId));
    }else if (tweet == null ){
      err=new Error("Tweet" + req.params.tweetId+"not found");
      err.status=404;
      return next(err);
    }
    else{
    err=new Error("Tweet" + req.params.commentId+"not found");
    err.status=404;
    return next(err);
    }
},(err)=>next(err))
.catch((err)=>next(err));
})

.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /tweets/'+ req.params.tweetId +"/comments"+req.params.commentId)
})

.put((req, res, next) => {
  Tweets.findById(req.params.tweetId)
  .then((tweet)=>{
    if(tweet != null && tweet.comments.id(req.params.commentId) != null){
      if(req.body.comment){
        tweet.comments.id(req.params.commentId).comment = req.body.comment;
      }
      tweet.save()
           res.statusCode=200;
           res.setHeader("Content-Type","application/json")
           res.json(tweet)
    }
    else if (tweet == null ){
      err=new Error("tweet" + req.params.tweetId+"not found")
      err.status=404;
      return next(err);
    }
    else{
    err=new Error("Comment" + req.params.commentId+"not found")
    err.status=404;
    return next(err);
    }
},(err)=>next(err))
.catch((err)=>next(err));
})

.delete((req, res, next) => {
  Tweets.findById(req.params.tweetId)
  .then((tweet)=>{
    let comment = tweet.comments.id(req.params.commentId)
    if(req.params.tweetId != null && comment != null){
        tweet.comments.id(req.params.commentId).remove();
      tweet.save()
      .then((tweet)=>{
        Tweets.findById(tweet._id)
        .populate("comments.author")
        .then((tweet)=>{
          res.statusCode=200;
          res.setHeader("Content-Type","application/json");
          res.json(tweet);

        })

      },(err)=>next(err));
    } else if(tweet == null ){
      err=new Error("Tweet" + req.params.tweetId+"not found");
      err.status=404;
      return next(err);
    } else{
      err=new Error("Comment" + req.params.commentId+"not found");
      err.status=400;
      return next(err);
    }
},(err)=>next(err))
.catch((err)=>next(err));
});


module.exports=tweetRouter;
