const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var User = require("./user");


const commentSchema = new Schema({

  comment:{
    type : String,
    required:true
  },
  author :{
    type: mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
},{timestamps:true

})

const tweetSchema = new Schema({
    tweet: {
        type: String,
        required: true
},
    comments : [commentSchema]
  },{
      timestamps:true

});

var Tweets = mongoose.model('Tweet', tweetSchema);

module.exports = Tweets;
