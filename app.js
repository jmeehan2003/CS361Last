var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator());
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);

// set up router
app.use('/', require('./home.js'));

app.use('/signup', require('./signup.js'));

app.use('/search', require('./search.js'));

app.use('/user', require('./user.js'));

app.use('/searchBio', require('./searchBio.js'));

app.use('/personalbloom', require('./personalbloom.js'));

app.use('/bloom', require('./bloom.js'));

app.use('/login', require('./login.js'));

app.use('/forgotPassword', require('./forgotPassword.js'));

app.use('/profile', require('./profile'));

app.use('/aboutus', require('./aboutus'));

app.use('/contactus', require('./contactus'));

app.use('/news', require('./news'));

app.use('/trending', require('./trending'));

app.use('/map', require('./map'));


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

