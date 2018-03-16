module.exports = function(){
    	var express = require('express');
    	var router = express.Router();
	var expressValidator = require('express-validator');
	
function getBiodiversity(res, mysql, context, complete){
	mysql.pool.query("SELECT id, type FROM biodiversity", function(err, results, fields) {
		if (err) throw err;
		context.biotypes = results;
		complete();
	});
}

router.get('/', function(req, res){
	var callbackCount = 0;
	var context = {};
	var mysql = req.app.get('mysql');
	getBiodiversity(res, mysql, context, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 1){
			res.render('signup', context);
		}
	}
});

router.post('/', function(req, res){
	var mysql = req.app.get('mysql');
	// set blank fields to null for proper database insertion	
	const zip = req.body.zip;
	const phone = req.body.phone;
	const street2 = req.body.street2;
	const skills = req.body.skills;
	const state = req.body.state;
	const bio = req.body.bio;
	if (street2.length == 0)
		req.body.street2 = null;
	if (phone.length == 0)
		req.body.phone = null;
	if (zip.length == 0)
		req.body.zip = null;
	if (state == "")
		req.body.skills;
	if (state == "...")
		req.body.state = null;
	if (skills.length == 0)
		req.body.skills = null;
	if (bio == "")
		req.body.bio = null;
	
	// validate form fields
	const password = req.body.password;
	req.checkBody('fname', 'First name field cannot be empty.').notEmpty();
	req.checkBody('lname', 'Last name field cannot be empty.').notEmpty();
	req.checkBody('useremail', 'Email field cannot be empty.').notEmpty();
	req.checkBody('street', 'Address field cannot be empty.').notEmpty();
	req.checkBody('city', 'City field cannot be empty.').notEmpty();
	req.checkBody('country', 'Country field cannot be empty.').notEmpty();
	req.checkBody('useremail', 'The email you entered is invalid, please try again.').isEmail();
	req.checkBody('useremail', 'Email address must be between 4 and 50 characters long. Please try again.').len(4, 50);
	req.checkBody('password', 'Password must have at least one lowercase letter, one uppercase letter, one number, and one special character.').matches(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?@$%^&*!-]).{8,}$/);
	req.checkBody('password', 'Passwords must be between 8 and 20 characters long.').len(8, 20);
	req.checkBody('verpassword', 'Passwords do not match. Please try again.').equals(password);
	const errors = req.validationErrors();
	
	// if errors make them re-enter the information
	if (errors) {
		console.log(`errors: ${JSON.stringify(errors)}`);
		var context = {};
		var callbackCount = 0;
		getBiodiversity(res, mysql, context, complete);
		function complete() {
		callbackCount++;
		if (callbackCount >= 1){
			context.title = 'Registration Error';
			context.errors = errors;
			res.render('signup', 
			//title: 'Registration Eriror',
			//errors: errors,
			context
			
			
			);	
		}	
	}
}
	
	else {
		var sameUser = false;
		mysql.pool.query("SELECT LOWER(email) FROM users WHERE email = ?", req.body.useremail.toLowerCase() ,function(error, results, fields) {
			var allEmails = []
			allEmails = results;
			console.log(allEmails.length);
			console.log(allEmails);
			var callbackCount = 0;
			if (allEmails.length > 0){
				sameUser = true;
				console.log(sameUser);
				complete();
			}
			else
				complete();
			
			function complete() {
				callbackCount++;
				if (callbackCount >= 1) {
					if (sameUser)  { 
						res.render('login', { 
						errorMessage: "The email you entered already exists in the database.  Please login or select the forgot password link." 
						}); 
					}
		
					else {
						mysql.pool.query("INSERT INTO users (`first_name`, `last_name`, `street`, `street2`, `city`, `state`, `zip`, " +
	        				"`country`, `phone`,`email`,`skills`,`bio_fav`,`password`) " +
	        				"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
	        				[req.body.fname, req.body.lname, req.body.street, req.body.street2, req.body.city, req.body.state,
	            				req.body.zip, req.body.country, req.body.phone, req.body.useremail,req.body.skills, req.body.bio,
		   				req.body.password],function(error, results, fields) {
						if (error) {
							var msg = JSON.stringify(error);
							var read_msg = JSON.parse(msg);
							var err_msg = read_msg.sqlMessage;
							res.set('content-Type', 'text/html');
							res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
							res.write(err_msg);
							res.write("</br><p>To return to the Sign Up page click <a href='signup'>here</a></p>");
							res.end();
			    			} 
					
						else {
							res.render('login', {
							loginMessage: 'Congrats! You have successfully created an account.'
			   				});
			  			}
						});
     					}											
				}
			}
		});
		
		console.log(sameUser);
 }
});

return router;
} ();
