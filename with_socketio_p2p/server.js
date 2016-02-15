var fs = require('fs')
var express = require('express.io');
var app = express();
var PORT = 3000;

options = {
    key: fs.readFileSync('./keys/key'), 
    cert: fs.readFileSync('./keys/cert')
} 

app.https(options).io()
// app.http().io();

app.use(express.static(__dirname +'/public'));

app.get('/', function(req, res){
  res.render('./public/index.html');
});

app.io.route('ready', function(req){
  req.io.join(req.data.chat_room);
  req.io.join(req.data.signal_room);
  app.io.room(req.data).broadcast('accounce', {
    message: 'New Client in Room:'+req.data
  });
});

app.io.route('send', function(req){
  app.io.room(req.data.room).broadcast('message', {
    message: req.data.message,
    author: req.data.author
  });
});


app.io.route('signal', function(req){
  // this is not a typo, using req.io instead of app.io to send to
  // everybody else except the senders
  console.log('signaling');
  req.io.room(req.data.room).broadcast('signaling_message', {
    type: req.data.type,
    message: req.data.message
  });
});

console.log('Express.io server started');
console.log('Please visit https://localhost:'+PORT+'/');
app.listen(PORT);