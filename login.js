var express = require('express');
var router = express.Router();
var assert = require('assert');
var loginMessage = '';

function validateLogin(email, password) {
  var errors = [];
  // email validation
  if (email == undefined || email.length == 0 || !(email.indexOf('@') > -1 && email.indexOf('.') > -1)) {
    errors.push('Valid email address is required.');
  }
  // password validation
  if (password == undefined || password.length == 0) {
    errors.push('Valid password is required.');
  }
  return errors;
}

function validateAgainstDB(email, pswd, mySql, res, callback) {
  var trycount=0;
  var context = {};
  var sql = "SELECT * FROM users WHERE email = '" + [email] + "'";
  mySql.pool.query(sql, function (error, results, fields) {
    if (error) {
      res.render('login', { loginMessage: 'System error. Login is currently not available. '});
    }else{
      if(results.length >0){
        if((results[0].password == pswd) && (results[0].logins < 3)){
          trycount = results[0].logins;
          if(trycount>=3){
            res.render('login', { loginMessage: 'Account has been locked. Contact site administrator.'});
          } else {
            var sql = "UPDATE users set logins =0 WHERE email = '" + results[0].email + "'";
            mySql.pool.query(sql, function (error, result) {
              if (error) throw error;
              console.log(result.affectedRows + " record(s) updated - try count " + trycount);
            });
            res.render('profile', context);
          }
        }
        else{
          trycount = results[0].logins;
          trycount++;
          //update database
          var sql = "UPDATE users set logins =" + trycount + " WHERE email = '" + results[0].email + "'";
          mySql.pool.query(sql, function (error, result) {
            if (error) throw error;
            console.log(result.affectedRows + " record(s) updated - try count " + trycount);
          });
        
          if(trycount>=3){
            res.render('login', { errorMessage: 'Account has been locked. Contact site administator.'});
          } else {
          res.render('login', { errorMessage: 'Wrong password'});
          }
        }
      }
      else{
        res.render('login', { errorMessage: 'Email does not exist'});
      }
    }
  });
}

router.get('/', function(req, res, next){
    res.render('login');
});

/*router.post('/', function(req, res) {
  loginMessage = '';
  var errors = validateLogin(req.body.email, req.body.password,res);
  if(errors.length == 0) {
  var mysql = req.app.get('mysql');
  validateAgainstDB(req.body.email, req.body.password, mysql, res, function (dbErrors, user) {
    errors = errors.concat(dbErrors);
    if (errors.length == 0) {
      var context = {};
      req.session.name = user.name;
      req.session.email = user.email;
      context.email = req.body.email 
      res.render('/profile', context);
    }
    else {
     res.render('login', {errors: errors});
    }
  });
}
  else {
	for (i = 0; i < errors.length; i++)
	{
		loginMessage += errors[i].toString();
	}
	res.render('login', {
			loginMessage: loginMessage
		});
  }
 
});*/

module.exports = router;
module.exports.validateLogin = validateLogin;
module.exports.validateAgainstDB = validateAgainstDB;




