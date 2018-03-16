module.exports = function(){
    	var express = require('express');
    	var router = express.Router();
	var expressValidator = require('express-validator');
	var userLoggedInId = 0;

function getUserDetails(res, mysql, context, key, complete) {
	var sql = "SELECT first_name, last_name, email, skills FROM users WHERE users.id = ?";
	console.log(key);
	var key = [key];  
	mysql.pool.query(sql, key, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.user = results[0];
		console.log(context);
		console.log("completed user details query");
		complete();
		});
}

function getBiodiversityFavorite(res, mysql, context, key, complete){
	var sql = "SELECT type FROM biodiversity INNER JOIN users ON biodiversity.id = users.bio_fav WHERE users.id = ?";
	console.log(key);
	var key = [key];  
	mysql.pool.query(sql, key, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.biotype = results[0];
		console.log(context);
		console.log("completed user details query");
		complete();
		});
}
function getUserBlooms(res, mysql, context, key, complete) {
	var sql = "SELECT name, details, DATE_FORMAT(date, '%m/%d/%Y') AS date, biodiversity.type AS biotype FROM blooms INNER JOIN biodiversity ON blooms.biotype = biodiversity.id INNER JOIN users ON blooms.userid = users.id WHERE users.id = ?";
	console.log(key);
	var key = [key];  
	mysql.pool.query(sql, key, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.blooms = results;
		console.log(context);
		console.log("completed user blooms query");
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
	"WHERE users.id = " + key;
	mysql.pool.query(sql, function (error, results, fields) {
	  if (error) {
		res.write(JSON.stringify(error));
		res.end();
	  }else{
		context.pagecomments = results;
		complete();
	}});  
  }
  
router.get('/:id', function(req, res){
	var context = {};
	var callbackCount = 0;
	var mysql = req.app.get('mysql');
	var userid = req.params.id;
	userLoggedInId = userid;
	getUserDetails(res, mysql, context, userid, complete);
	getUserBlooms(res, mysql, context, userid, complete);
	getBiodiversityFavorite(res, mysql, context, userid, complete);
	getUserComments(res, mysql, context, userid, complete);
	function complete() {
	callbackCount++;
	if (callbackCount >= 4) {
	      console.log("Sending to user page");
	      res.render('user', context);
	}
      };
});

//post new comment 
router.post('/', function(req, res) {
	var comment = req.body.comment;
	var posterEmail = req.body.PosterEmail;
	var userid = req.params.id;
	var commentId = 0;
	var posterId = 0;
	var mysql = req.app.get('mysql');
	var context = {};
	var sql = "";

	sql = "INSERT INTO comments(comment) VALUES ('" + comment + "')";
	mysql.pool.query(sql, function (error, result) {
		if (error) {
			throw error;
		} else {
		  console.log(result.affectedRows + " record(s) inserted");
		  sql = "SELECT id FROM comments ORDER BY id DESC LIMIT 1";
		  mysql.pool.query(sql, function (error, results, fields) {
			  if (error) {
				res.write(JSON.stringify(error));
				res.end();
			  }else {
				  commentId = results[0].id;
				  sql = "SELECT id from users where email = '" + posterEmail + "'";
				  mysql.pool.query(sql, function (error, results, fields) {
					  if (error) {
						res.write(JSON.stringify(error));
						res.end();
					  }else { 
						if(results.length >0){
						posterId = results[0].id;
						sql = "INSERT INTO users_comments(uid, cid, for_uid, CurTime) " + 
						" VALUES (" + userLoggedInId + "," + commentId + "," + posterId + ",NOW())";
						mysql.pool.query(sql, function (error, result) {
							if (error) throw error;
							res.redirect('back');
						});
					}
					}});
				}});
			}});

	});
return router;
} ();