module.exports = function() {
	var express = require('express');
	var router = express.Router();

function searchBlooms(res, mysql, context, key, complete) {
var sql = "SELECT 'User' AS Category, CONCAT(users.first_name, ' ', users.last_name) AS Name, users.id AS id FROM users WHERE users.first_name LIKE ? OR users.last_name LIKE ? UNION SELECT 'Bloom' AS Category, blooms.name AS Name, blooms.id AS id FROM blooms WHERE blooms.name LIKE ?";
var q = ['%'+key+'%'];

var inserts = [q, q, q];
mysql.pool.query(sql, inserts, function(error, results, fields) {
	if (error) {
		var msg = JSON.stringify(error);
		res.write(msg);
		res.end();
	}
	else {
		context.search = results;
		complete();
	}
});
}

router.get('/', function(req, res) {
	var callbackCount = 0;
	var context = {};
	var key = req.query.searchVal;
	context.searchWord = req.query.searchVal;
	var mysql = req.app.get('mysql');
	searchBlooms(res, mysql, context, key, complete);
	function complete(){
		callbackCount++;
		if(callbackCount >= 1){
			res.render('search', context);
		}	
	}
});

return router;

}();
