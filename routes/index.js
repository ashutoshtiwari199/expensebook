var express = require('express');
var router = express.Router();
const User = require('./users')
const Expense = require('./expense')
const passport = require('passport');
const localStrategy = require('passport-local');
const uniqid = require('uniqid')

passport.use(new localStrategy(User.authenticate()));

//***** */ GET home page. *******/
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});



// **********User Register Route *****************//
router.post('/register', function (req, res) {
  const newuserModel = new User({
    username: req.body.username,
    name: req.body.name,
    password: req.body.password,
  })
  User.register(newuserModel, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        console.log("admin");
        res.redirect('/profile')
      })
    }).catch(function (err) {
      res.send(err);
    })
}
)



// ************Add user Route****************//

router.post('/adduser', isLoggedIn, function (req, res) {
  Expense.findOne({ _id: req.body.localstorage })
    .then((found) => {
      if (found.adminusername === req.session.passport.user) {
        User.findOne({ username: req.body.username })
          .then((userfound) => {
            console.log("69696969696969696"+userfound);
            userfound.expensename.push(found)
            userfound.save()
            found.otheruser.push(userfound)
            found.save();
            res.redirect(`/profile/${req.body.localstorage}`)
          }).catch(function (err) {
            res.send("errr  "+err);
          })
      } else {
        console.log("Not Allow")
        res.json("You Can not add user Only admin does!!!")
      }
    })
})



// ************Work need to be done************
// router.get('/checkuser/:username/:localstorage', function (req, res) {
//   console.log(`"user ${req.params.username} local ${req.params.localstorage}`)
//   Expense.findOne({ _id: req.params.localstorage }).populate('otheruser').exec((err, posts) => {
//     console.log("Populated User " + posts);
//   })
// })


// *************Create Expense*************//

router.post('/createexpense', isLoggedIn, (req, res) => {
  User.findOne({ username: req.session.passport.user })
    .then((found) => {
      Expense.create({
        expensename: req.body.expensename,
        adminname: found.name,
        adminusername: found.username
      }).then((created) => {
        found.expensename.push(created)
        found.save().then(function () {
          res.send(created);
        })
      }).catch((err) => {
        res.send(err)
      })
      res.redirect('/profile')
    })
})



// **********Profile*************//

router.get('/profile', isLoggedIn, function (req, res) {
  User.findOne({ username: req.session.passport.user }).then(user => {
    Expense.find()
      .then(val => {
        res.render('profile', { expensename: val, expensefound: null,username:req.session.passport.user, user: user.expensename, currentuser:user.name })
      })
  })
})


// ************* Profile with expense Route***************//

router.get('/profile/:expense', isLoggedIn, function (req, res) {
  Expense.find()
  .then(val => {
    Expense.findOne({ _id: req.params.expense }).then(expensefound => {
      User.findOne({ username: req.session.passport.user }).then(founduser => {
        res.render('profileexp', {
          goods: expensefound.expenseamount,
          expenseid: expensefound,
          currentselectedexpense:expensefound.expensename,
          isAdmin: isadmin(expensefound.adminusername, req.session.passport.user),
          expensename: founduser.expensename,
          currentuser: req.session.passport.user,
          personalexp: pesronal_amount(expensefound.expenseamount, req.session.passport.user),
          total: total_amount(expensefound.expenseamount),
          spentby: expensefound.spentby,
          individualExpense: eliminate_dup(expensefound.expenseamount),
          })
        })
      })
    })
})

// *************Entry delete route***************

router.get('/delete/:ele/:expId', function (req, res) {
  var newvalues = { $pull: { "expenseamount": { "txnId": req.params.ele } } }
  Expense.updateOne({_id:req.params.expId}, newvalues, { multi: true }, function (err, res) {
    if (err) console.log(err);
    console.log("deleted")
  })
  res.redirect(`/profile/${req.params.expId}`)
})

// *************update transaction route********************//

router.post('/updatetxn/:txnId/:expenseId',(req,res)=>{
  const txnId= req.params.txnId;
  const tobeupdate= req.body;
  Expense.findOne({_id: req.params.expenseId}).then(expense=>{
    const expenseArray= expense.expenseamount
    Expense.updateOne( {_id : req.params.expenseId},
    {$set : {"expenseamount" : updateTxn(txnId,expenseArray,tobeupdate)} } ,
    (err,result)=>{
      if(err) res.json(err);
      res.redirect(`/profile/${req.params.expenseId}`)

    });
  })
})


// ***********This add transaction rout**************

router.post('/addtransaction', isLoggedIn, function (req, res) {
  User.findOne({ username: req.session.passport.user }).then(userfound => {
    Expense.findOne({ _id: req.body.localstorage }).then(expensefound => {
      expensefound.expenseamount.push({
        spentby: req.session.passport.user, 
        goods: req.body.goodsname,
        amount: req.body.amount, 
        txnId: (uniqid() + uniqid.time() + uniqid.process()), 
        date: GetFormattedDate(),
        time: GetFormattedTime()
      })
      expensefound.save()
      res.redirect(`/profile/${req.body.localstorage}`)
    })
  })
})





// *********Login Route with passport *********

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (req, res, next) { });



//***************Logout route*****************//

router.get('/logout', function (req, res, next) {
  req.logOut();
  res.redirect('/')
});



// *********End Of Routes****************//


// *******Function*********//


// **********IsLoggedIn Function*********//

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}



//***********Total Amount Function******************** */
function total_amount(val) {
  var result = 0;
  val.forEach(element => {
    result += +(element.amount)
  });
  return result;
}

// **************Peronal Amount Function******************//


function pesronal_amount(val, name) {
  var result = 0;
  val.forEach(element => {
    if (element.spentby === name) {
      result += +(element.amount)
    }
    else{
      return 0;
    }
  });
  return result;
}


// *********Is Admin Function***************/

function isadmin(val1, val2) {
  if (val1 === val2) return true
  else return false;
}


// *******Get Formatted Date function*******//

function GetFormattedDate() {
  var todayTime = new Date();
  var month = (todayTime.getMonth() + 1);
  var day = (todayTime.getDate());
  var year = (todayTime.getFullYear());
  return day + "/" + month + "/" + year;
}


// ******** Time Function*************//
function GetFormattedTime() {
  var datetime = new Date();
  var hour = datetime.getHours();
  var minute = datetime.getMinutes();
  var second = datetime.getSeconds();
    return    hour +":"+ minute + ":" + second;
}

// ====== update transaction function=======

function updateTxn(txnId,expenseamountarray,objupdt){
  let index= expenseamountarray.findIndex((obj => obj.txnId == txnId));
  expenseamountarray[index]= objupdt; 
  return expenseamountarray;
}


// ------****** function for personnel expense*******
function eliminate_dup(expo){
  let exp=JSON.parse(JSON.stringify(expo))
  for(let i=0; i<exp.length;i++){
    for(let j=i+1; j<exp.length; j++){
      if(exp[i].spentby===exp[j].spentby ){
        exp[i].amount = +(exp[i].amount) + +(exp[j].amount);
        exp[j]="";  
      }
    }
  }
  return exp.filter(function (e) {return e != "";})
}


module.exports = router;

