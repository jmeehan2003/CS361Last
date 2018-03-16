module.exports = function(){
    	var express = require('express');
    	var router = express.Router();
	var expressValidator = require('express-validator');


function getBloomDetails(res, mysql, context, key, complete) {
	var sql = "SELECT name, details, DATE_FORMAT(date, '%m/%d/%Y') AS date, biodiversity.type AS biotype, users.id AS userid, users.city AS city, users.country AS country, CONCAT(users.first_name, ' ', users.last_name) AS username FROM blooms INNER JOIN biodiversity ON blooms.biotype = biodiversity.id INNER JOIN users ON blooms.userid = users.id WHERE blooms.id = ?";
	console.log(key);
	var key = [key];  
	mysql.pool.query(sql, key, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		console.log("results length : " + results.length);
		context.bloom = results[0];
		console.log(context);
		console.log("completed blooms query");
		complete();
		});
}

router.get('/:id', function(req, res){
	var context = {};
	var callbackCount = 0;
	var mysql = req.app.get('mysql');
	var userid = req.params.id;
	getBloomDetails(res, mysql, context, userid, complete);
	function complete() {
	callbackCount++;
	if (callbackCount >= 1) {
	      console.log("Sending to bloom page");
	      res.render('blooms', context);
	}
      };
});



return router;
} ();
