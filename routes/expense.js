const mongoose = require('mongoose')
const {ObjectId}= mongoose.Schema;
// var plm = require('passport-local-mongoose')


// mongoose.connect('mongodb://localhost/GEM')


var expenseSchema= mongoose.Schema({
    expensename:String,
    adminname:String,
    adminusername:String,
    expenseamount:[],
    otheruser:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    spentby:["username"]
    
})

module.exports = mongoose.model('expense', expenseSchema);