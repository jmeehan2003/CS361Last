var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs361_meehajam',
  password        : 'bloomterra1',
  database        : 'cs361_meehajam',
  dateStrings	  : true
});

module.exports.pool = pool;
