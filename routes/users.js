var mongoose = require('mongoose');
var plm = require('passport-local-mongoose')

// mongoose.connect('mongodb://localhost/GEM3',{ useNewUrlParser: true,useUnifiedTopology: true });
mongoose.connect('mongodb+srv://ashutosh123:ashutosh123@testdb-ppgjk.mongodb.net/sample_airbnb?retryWrites=true&w=majority',{useNewUrlParser: true,useUnifiedTopology: true})



var adminModel= mongoose.Schema({
  username:String,
  email: String,
  name:String,
  isadmin:Boolean,
  password:String,
  expensename:[]
})

adminModel.plugin(plm);
module.exports=mongoose.model('user', adminModel);