var express = require('express.io');
var app = express();
app.http().io();
var PORT = 3000;
console.log('Express.io server started');

app.use(express.static(__dirname +'/public'));

app.get('/', function(req, res){
  res.render('./public/index.html');
});

app.io.route('ready', function(req){
  req.io.join(req.data);
  app.io.room(req.data).broadcast('accounce', {
    message: 'New Client in Room:'+req.data
  });
});

console.log('Please visit http://localhost:'+PORT+'/');
app.listen(PORT);
