module.exports = function(){
    	var express = require('express');
    	var router = express.Router();
	var expressValidator = require('express-validator');
	
router.get('/', function(req, res){
	var context = {};
	res.render('aboutus', context);
});

return router;
} ();
