var express = require('express');
var app = express();
console.log('Express server started');

app.use(express.static(__dirname +'/public'));

app.get('/', function(req, res){
  res.render('index.html');
});

console.log('Please visit http://localhost:3000/');
app.listen(3000);
