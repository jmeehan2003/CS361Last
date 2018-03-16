module.exports = function(){
    	var express = require('express');
    	var router = express.Router();
	var expressValidator = require('express-validator');

function searchBloomByCategory(res, mysql, context, key, complete){
var sql = "SELECT CONCAT(users.first_name, ' ', users.last_name) AS username, users.id AS userid, name, users.city AS city, users.country AS country, blooms.id AS id, details, DATE_FORMAT(date, '%m/%d/%Y') AS date FROM blooms INNER JOIN users ON blooms.userid = users.id INNER JOIN biodiversity ON blooms.biotype = biodiversity.id WHERE biodiversity.id = ?";
var insert = [key];
mysql.pool.query(sql, key, function(error, results, fields) {
	if (error) {
		var msg = JSON.stringify(error);
		res.write(msg);
		res.end();
	}
	else {
		context.search = results;
		console.log(context);
		complete();
	}
});
}

function getBioCategory(res, mysql, context, key, complete){
var sql = "SELECT type FROM biodiversity WHERE biodiversity.id = ?";
var insert = [key];
mysql.pool.query(sql, key, function(error, results, fields) {
	if (error) {
		var msg = JSON.stringify(error);
		res.write(msg);
		res.end();
	}
	else {
		context.biotype = results[0];
		console.log(context);
		complete();
	}
});
}
	
router.get('/', function(req, res){
	var context = {};
	var callbackCount = 0;
	var mysql = req.app.get('mysql');
	var key = req.query.bio;
	searchBloomByCategory(res, mysql, context, key, complete);
	getBioCategory(res, mysql, context, key, complete);
	function complete(){
		callbackCount++;
		if(callbackCount >= 2){
			res.render('searchBio', context);
		}	
	}
});

return router;
} ();
