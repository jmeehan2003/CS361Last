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
          } 
	else {
            var sql = "UPDATE users set logins =0 WHERE email = '" + results[0].email + "'";
            mySql.pool.query(sql, function (error, result) {
              if (error) throw error;
              console.log(result.affectedRows + " record(s) updated - try count " + trycount);
            });
	 const myemail = email;
      	callbackCount = 0;
      	var context = {};
      	getUserData(res, mySql, context, email, complete); 
	getUserBlooms(res, mySql, context, email, complete);
	getUserComments(res, mySql, context, email, complete);
	getBiodiversity(res, mySql, context, complete);
	function complete() {
	callbackCount++;
	if (callbackCount >= 4) {
		console.log("Sending to profile page");
	      res.render('profile', context);
	}
      }
        
           
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

function getUserData(res, mysql, context, key, complete) {
	var sql = "SELECT first_name, last_name, id, email, skills, bio_fav FROM users WHERE users.email = ?";
	console.log(key);
	var key = [key];  
	mysql.pool.query(sql, key, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.user = results[0];
		complete();
		});
}

function getUserComments(res, mysql, context, key, complete) {
  context.pagecomments = {Comment: 'No one has commneted on your profile yet.'};
  var sql = "SELECT users.first_name as 'UserName', cmt.comment as 'Comment', usr.CurTime as 'CommentDate' " +
  "from users_comments usr " +
  "inner join comments cmt " +
  "on cmt.id = usr.cid " +
  "INNER JOIN users " +
  "ON usr.uid = users.id " +
  "WHERE users.email = '" + key + "'";
  mysql.pool.query(sql, function (error, results, fields) {
    if (error) {
      res.write(JSON.stringify(error));
      res.end();
    }else{
      context.pagecomments = results;
      complete();
  }});  
}

function getBiodiversity(res, mysql, context, complete){
	mysql.pool.query("SELECT id, type FROM biodiversity", function(err, results, fields) {
		if (err) throw err;
		context.biotypes = results;
		complete();
	});
}

function getUserBlooms(res, mysql, context, key, complete) {
	var sql = "SELECT name, details, DATE_FORMAT(date, '%m/%d/%Y') AS date, biodiversity.type AS biotype FROM blooms INNER JOIN biodiversity ON blooms.biotype = biodiversity.id INNER JOIN users ON blooms.userid = users.id WHERE users.email = ?";
	console.log(key);
	var key = [key];  
	mysql.pool.query(sql, key, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.bloom = results;
		console.log(context);
		console.log("completed user blooms query");
		complete();
		});
}
router.get('/', function(req, res, next){
    res.render('login');
});

router.post('/', function(req, res) {
  loginMessage = '';
  const email = req.body.email;
  var errors = validateLogin(req.body.email, req.body.password,res);
  if(errors.length == 0) {
  var mysql = req.app.get('mysql');
 validateAgainstDB(req.body.email, req.body.password, mysql, res, function (dbErrors, user) {
    errors = errors.concat(dbErrors);
    if (errors.length == 0) {
      req.session.name = user.name;
      req.session.email = user.email;
      const myemail = req.body.email;
      console.log("email in post " + myemail);
      callbackCount = 0;
      var context = {};
      getUserData(res, mysql, context, email, complete); 
      getUserComments(res, mysql, context, email, complete);	 
     getUserBlooms(res, mysql, context, email, complete);
      function complete() {
	callbackCount++;
	if (callbackCount >= 3) {
		console.log("Sending to profile page");
	      res.render('profile', context);
	}
      }
      
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
 
});

module.exports = router;
module.exports.validateLogin = validateLogin;
module.exports.validateAgainstDB = validateAgainstDB;



