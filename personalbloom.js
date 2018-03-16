module.exports = function() {
	var express = require('express');
	var router = express.Router();
	var expressValidator = require('express-validator');


function getUserData(res, mysql, context, id, complete) {
	mysql.pool.query("SELECT email, city, state, country FROM users WHERE users.id = ?", id ,function(error, results, fields) {;
	if (error) {
		res.write(JSON.stringify(error));
		res.end();
	}
	userid = id;
	context.user = results[0];
	context.userid = {id: userid};
	console.log(context);
	console.log("completed query");
	complete();
	});
}

function getBiodiversity(res, mysql, context, complete){
	mysql.pool.query("SELECT id, type FROM biodiversity", function(err, results, fields) {
		if (err) throw err;
		context.biotype = results;
		complete();
	});

}
router.get('/', function(req, res){
	var callbackCount = 0;
	var id = req.query.userid; 
	console.log("Get userid: " + id);
	var context = {};
	var mysql = req.app.get('mysql');
	getUserData(res, mysql, context, id, complete);
	getBiodiversity(res, mysql, context, complete);
	function complete() {
	callbackCount++;
	if (callbackCount >= 2) {	
		if(id == "" || id == null)
			res.render('login', { errorMessage: "Please log in" }); 
		else
			res.render('personalbloom', context);	
	}
	}
});

	router.post('/', function(req, res) {
	//	const useremail = req.body.useremail;		
		var context = {};
		var callbackCount = 0;
		var mysql = req.app.get('mysql');
	//	getUserData(res, mysql, context, email, complete);
		const pname = req.body.pname;
		const pinfo = req.body.pinfo;
		const ptype = req.body.ptype;
		const userid = req.body.userid;

		console.log(ptype + " userid  " + userid);

	/*	if($("#displayname").is(":checked")){privacy.displayName = 'y';}
		else{ privacy.displayName = 'n';}
		if($("#displayemail").is(":checked")){privacy.displayEmail = 'y';}
		else{ privacy.displayEmail = 'n';}
		if($("#displayphone").is(":checked")){privacy.displayPhone = 'y';}
		else{ privacy.displayPhone = 'n';}
		if($("#comments").is(":checked")){privacy.comments = 'y';}
		else{ privacy.comments = 'n';}
		if($("#aafollowers").is(":checked")){privacy.aaFollowers = 'y';}
		else{ privacy.aaFollowers = 'n';}
		if($("#dfollowers").is(":checked")){privacy.dFollowers = 'y';}
		else{ privacy.dFollowers = 'n';}

		console.log(privacy); */
		



		req.checkBody('pname', 'Project Name field cannot be empty.').notEmpty();
		req.checkBody('pinfo', 'Project Info field cannot be empty.').notEmpty();
		const errors = req.validationErrors();
		if (errors) {
			console.log(`errors: ${JSON.stringify(errors)}`);
			var context = {};
			var callbackCount = 0;
			context.title = 'Creation Error';
			context.errors = errors;
			res.render('personalbloom', context);
		}
		else {
			//Date is automatically timestamped by mysql so doesn't have to be entered
			mysql.pool.query("INSERT INTO blooms (`biotype`, `name`, `details`, `userid`) " +
				"VALUES (?,?,?,?)", [ptype, pname, pinfo, userid],
				function(error, results, fields) {
					if (error) {
						var msg = JSON.stringify(error);
						var read_msg = JSON.parse(msg);
						var err_msg = read_msg.sqlMessage;
						res.set('content-Type', 'text/html');
						res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
						res.write(err_msg);
						res.end();
					} else {
						var context = {};
						res.render('profile', {
							title: 'Congrats! You have successfully created a new bloom. Please refresh or re login to see the Bloom on your page.'
						});
					}
				});
		}
	});

	return router;
}();
