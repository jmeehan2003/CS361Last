var express = require('express');
var router = express.Router();
var assert = require('assert');

/* GET forgotPassword page. */
router.get('/', function(req, res, next){
    res.render('forgotPassword');
});

function processForgotPassword(email, mySql, res, callback) {
    var context = {};
    var sql = "SELECT * FROM users WHERE email = '" + [email] + "'";
    mySql.pool.query(sql, function (error, results, fields) {
      if (error) {
        res.render('forgotPassword', { forgotMessage: 'System error. Forgot Password is currently not available.'});
      }
      else{
        if(results.length >0){
            res.render('forgotPassword', { forgotMessage: 'An e-mail has been sent to email address ' + [results[0].email] + ' to reset your password'});
        }else{
            res.render('forgotPassword', { forgotMessage: 'Email does not exist'});
          }
        }    
    });
  }
  
router.post('/', function (req, res) {
    var email = req.body.email;
    var mysql = req.app.get('mysql');
    var reset = processForgotPassword(email, mysql, res, function (err) {
        if (err) res.end('Error sending message: ' + err)
        else res.end('An e-mail has been sent to your email address to reset your password.')
    });   
});

module.exports = router;
