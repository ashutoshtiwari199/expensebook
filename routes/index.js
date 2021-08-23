var express = require('express');
var router = express.Router();
const User = require('./users')
const Expense = require('./expense')
const passport = require('passport');
const localStrategy = require('passport-local');
const uniqid = require('uniqid')

// const jwt = require('jsonwebtokennpm')
// const uuid =require('uuid')
// const uuid = require("uuid")
// import { v4 as uuidv4 } from 'uuid';





passport.use(new localStrategy(User.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  // console.log(uuidv4())
  // console.log(GetFormattedDate())
  // console.log(GetFormattedTime())
  res.render('index', { title: 'Express' });
  // console.log(uniqid(),uniqid.time(),uniqid.process())
});


router.post('/register', function (req, res) {
  // console.log(req.session.passport.user);
  const newuserModel = new User({
    username: req.body.username,
    name: req.body.name,
    password: req.body.password,
    // isadmin: true,
    // expensename: req.body.expensename
  })
  User.register(newuserModel, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        console.log("admin");

        res.redirect('/profile')
        // res.json(u)
      })
    }).catch(function (err) {
      res.send(err);
    })
}
)

// to be work on
router.post('/adduser', isLoggedIn, function (req, res) {
  // console.log("adduser excecuted")
  console.log("***--**-*-*-**-*-"+req.body.localstorage)
  Expense.findOne({ _id: req.body.localstorage })
    .then((found) => {
      if (found.adminusername === req.session.passport.user) {
        console.log("Allow")
        User.findOne({ username: req.body.username })
          .then((userfound) => {
            console.log("69696969696969696"+userfound);
            userfound.expensename.push(found)
            userfound.save()
              // console.log("============>>>" + found.otheruser.includes(userfound._id))
            // if(found.otheruser.includes(ObjectId("5eec9d3c9fb27b11740807a8"))){
            // if (true) {
            // } else {
            //   console.log("no")
            // }
            found.otheruser.push(userfound)
            found.save();
            // console.log("Push k pehle excecuted")

            // userfound.expensename=found
            // console.log("pilla")
            res.redirect(`/profile/${req.body.localstorage}`)
          }).catch(function (err) {
            res.send("errr  "+err);
          })
      } else {
        console.log("Not Allow")
        res.json("You Can not add user Only admin does!!!")
      }
      // console.log("req.body.localstorage"+ found)

    })
})



// *************Check user is availaible or not
router.get('/checkuser/:username/:localstorage', function (req, res) {
  console.log(`"user ${req.params.username} local ${req.params.localstorage}`)
  Expense.findOne({ _id: req.params.localstorage }).populate('otheruser').exec((err, posts) => {
    console.log("Populated User " + posts);
  })
    // User.findOne({ username: req.params.username })
    //   .then(function (userfound) {
    //     // console.log(founduser);
    //     // if( true && true){
    //     if (!userfound) {
    //       res.status(404).json("User does not found")
    //     } else if (userfound !== null && (found.otheruser.includes(userfound._id))) {
    //       res.json("User already exist in this expense")
    //     } else {
    //       res.json(userfound)
    //     }
    //     // if (userfound!==null && (found.otheruser.includes(userfound._id))) {
    //     //   console.log("============>>>" + found.otheruser.includes(userfound._id))
    //     // } else {
    //     //   console.log("no")
    //     // }
    //     // res.json(userfound)
    //   })
  // })
})


router.post('/createexpense', isLoggedIn, (req, res) => {
  console.log("hehehehehehehehehehehe");
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
          // res.redirect('/profile')
        })
      }).catch((err) => {
        res.send(err)
      })
      // res.send(created);

      res.redirect('/profile')

      // res.redirect(`/profile/${req.body.expensename}`)
    })
})



// router.get('/userprofile', isLoggedIn, function (req, res) {
//   console.log("executed sss5555")
//   User.findOne({ username: req.session.passport.user }).then(userfound => {
//     Expense.findOne({ expensename: userfound.expensename }).then(expensefound => {
//       res.render('userprofile', {
//         goods: expensefound.expenseamount, currentuser: req.session.passport.user,
//         personalexp: pesronal_amount(expensefound.expenseamount, req.session.passport.user),
//         total: total_amount(expensefound.expenseamount), spentby: expensefound.spentby, expensename: userfound.expensename
//       })
//     })
//   })
// })

router.get('/profile', isLoggedIn, function (req, res) {
  User.findOne({ username: req.session.passport.user }).then(user => {
    Expense.find()
      .then(val => {
        console.log(user.expensename)
        res.render('profile', { expensename: val, expensefound: null,username:req.session.passport.user, user: user.expensename, currentuser:user.name })
      })
  })
})

router.get('/profile/:expense', isLoggedIn, function (req, res) {
  // console.log(req.params.expense)
  Expense.find()
  .then(val => {
    Expense.findOne({ _id: req.params.expense }).then(expensefound => {
      User.findOne({ username: req.session.passport.user }).then(founduser => {
        // res.send("*****************************"+req.params.expense);
        res.render('profileexp', {
          goods: expensefound.expenseamount,
          expenseid: expensefound,
          currentselectedexpense:expensefound.expensename,
          // isAdmin:true,
          isAdmin: isadmin(expensefound.adminusername, req.session.passport.user),
          // alluser:founduser,
          expensename: founduser.expensename,
          currentuser: req.session.passport.user,
          // personalexp:2001,
          // total:1525,
          personalexp: pesronal_amount(expensefound.expenseamount, req.session.passport.user),
          total: total_amount(expensefound.expenseamount),
          spentby: expensefound.spentby,
          })
        })
      })
    })
})






// ******delete function
// function arrayRemove(arr, value) {
//   return arr.filter(function (ele) {
//     console.log(ele != value)
//     return ele != value;
//   });

// }


router.post('/dte', function (req, res) {
  console.log("jjjjjjjjjjjjj" + req.body.ele)
  var ele = req.body.ele
  console.log(ele)
  // ele= +ele
  // console.log(ele)
  var newvalues = { $pull: { "expenseamount": { "txnId": ele } } }
  console.log(newvalues)
  Expense.update({}, newvalues, { multi: true }, function (err, res) {

    if (err) throw err
    console.log("deleted")

  })
  res.redirect('/userprofile')

})

router.get('/delete/:ele/:expId', function (req, res) {
  // console.log("jjjjjjjjjjjjj" + req.body.ele)
  // console.log("jjjjjjjjjjjjj" + req.params.expId)
  //  var ele = req.params.ele
  // console.log(ele)
  // ele= ele.toString()
  // console.log(ele)
  var newvalues = { $pull: { "expenseamount": { "txnId": req.params.ele } } }
  // console.log(newvalues)
  Expense.update({}, newvalues, { multi: true }, function (err, res) {
    if (err) throw err
    console.log("deleted")
  })
  res.redirect(`/profile/${req.params.expId}`)
})






// *This only for test the populate function of Mongodb*****///
router.get('/populate', (req, res) => {
  Expense.findOne({ expensename: "Jaunpur" }).populate("otheruser").then(val => {
    // for(var n=0;n<3;n++){
    // if(val.username==="lulli"){
    res.json(val)
    // }
    // }
  })
})

var vill = "Srilanka"
// var l= localStorage.getItem("expense")
// var ctr = 0;



router.post('/addtransaction', isLoggedIn, function (req, res) {
  // console.log("hhhhhhhh  " + req.body.localstorage)
  User.findOne({ username: req.session.passport.user }).then(userfound => {
    Expense.findOne({ _id: req.body.localstorage }).then(expensefound => {
      // console.log("arrrrrray" + expensefound)

      expensefound.expenseamount.push({
        spentby: req.session.passport.user, 
        goods: req.body.goodsname,
        amount: req.body.amount, 
        txnId: (uniqid() + uniqid.time() + uniqid.process()), 
        date: GetFormattedDate(),
        time: GetFormattedTime()
      })
      // ctr += 1;
      // console.log("arrrrrray" + expensefound.expenseamount)

      // expensefound.spentby.push(req.session.passport.user)
      expensefound.save()
      // res.redirect('/profile')
      res.redirect(`/profile/${req.body.localstorage}`)
    })
  })
})



/******************************Trial*********** */

router.post('/addtransaction/:expname', isLoggedIn, function (req, res) {
  User.findOne({ username: req.session.passport.user }).then(userfound => {
    Expense.findOne({ expensename: "Srilanka" }).then(expensefound => {

      expensefound.expenseamount.push({
        spentby: req.session.passport.user, goods: req.body.goodsname,
        amount: req.body.amount, txnId: (uniqid() + uniqid.time() + uniqid.process())
      })
      expensefound.spentby.push(req.session.passport.user)
      expensefound.save()
      // res.redirect('/profile')
      res.redirect(`/profile/${vill}`)
    })
  })
})














router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (req, res, next) { });



// logout
router.get('/logout', function (req, res, next) {
  req.logOut();
  res.redirect('/')
});








function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}

function total_amount(val) {
  var result = 0;
  val.forEach(element => {
    result += +(element.amount)
  });
  return result;
}

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

function isadmin(val1, val2) {
  // console.log("val1===" + val1)
  // console.log("val2===" + val2)
  if (val1 === val2) return true
  else return false;
}

function GetFormattedDate() {
  var todayTime = new Date();
  var month = (todayTime.getMonth() + 1);
  var day = (todayTime.getDate());
  var year = (todayTime.getFullYear());
  return day + "/" + month + "/" + year;
}
function GetFormattedTime() {
  var datetime = new Date();
  var hour = datetime.getHours();
  var minute = datetime.getMinutes();
  var second = datetime.getSeconds();
    return    hour +":"+ minute + ":" + second;
}
module.exports = router;













// else {
//   console.log("hello from second");
//   const newuserModel = new User({
//     username: req.body.username,
//     name: req.body.name,
//     password: req.body.password,
//     isadmin: false,
//     // expensename: req.body.expensename
//   })
//   User.register(newuserModel, req.body.password)
//     .then(function (u) {
//       passport.authenticate('local')(req, res, function () {
//         // res.redirect('/profile')
//         res.json(u)
//       })
//     }).catch(function (err) {
//       res.send(err);
//     })
// }