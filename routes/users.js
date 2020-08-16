var express = require('express');
const bodyParser = require("body-parser");
var User = require("../models/user");
var router = express.Router();
var passport = require("passport");
router.use(express.static("public"));
var authenticate = require('../authenticate');

/* GET users listing. */
router.get('/',authenticate.verifyUser,(req, res, next) => {
	User.find({})
		.then((users) => {
			res.statusCode = 200
			res.setHeader('Content-Type', 'application/json')
			res.send(users)
		})
		.catch(err => next(err))
})

router.use(bodyParser.urlencoded({extended:true}));

router.post("/signup",(req,res,next)=>{                    //passportLocalMongoose plugin supplies useful metrics for us
  User.register(new User({username: req.body.username})    //to use in sing up and login process =>method call "Register"and"login" instead of ex:find
    ,req.body.password,(err,user)=>{                       //  register(new User{},password)      //delete .then((user))and exhange by (err,user)
    if(err){
      res.statusCode=500;
      res.setHeader("Content-Type","application/json")
      res.send({err:err });
    }
    else {
        if(req.body.firstname)
            user.firstname = req.body.firstname;
        if(req.body.lastname)
            user.lastname = req.body.lastname;
            user.save((err,user)=>{
              if(err){
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.send({err: err});
                return ;
              }
                passport.authenticate("local")(req,res,()=>{
                res.statusCode=200;
                res.setHeader("Content-Type","application/json")
                res.send({status:"Registeration Successful!", user : user });
            })
      });
    }
  });
});

router.get("/login",(req,res)=>{

  res.redirect("/users/login.html")
  res.send(req.user)
})

router.post("/login",passport.authenticate("local"),(req,res)=>{
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode=200;
  res.setHeader("Content-Type","text/html")
  res.send({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout',(req, res) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	} else {
		var err = new Error('You are not logged in!');
		err.status = 403;
		next(err);
	}
});

router.delete('/',(req, res, next) => {
	User.remove({})
		.then(
			(resp) => {
				res.statusCode = 200;
				res.setHeader('Content-type', 'application/json');
				res.json(resp);
			},
			(err) => next(err)
		)
		.catch((err) => next(err));
});

module.exports = router;
