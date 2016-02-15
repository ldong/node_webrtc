(function() { 
  var isAudio = false;
  var isVideo = true;
  var localVideo = document.getElementById('localVideo');
  var remoteVideo = document.getElementById('remoteVideo');

  var myName = document.getElementById('myName');
  var myMessage = document.getElementById('myMessage');
  var sendMessage = document.getElementById('sendMessage');
  var chatArea = document.getElementById('chatArea');
  var signalingArea = document.getElementById('signalingArea');

  var ROOM = 'CHAT';
  var SIGNAL_ROOM ='SIGNAL_ROOM';

  var onSuccess = function(stream) {
    console.log('Success');
    localVideo.src = window.URL.createObjectURL(stream);
    localVideo.play();
  };

  var onError = function(error) {
    console.log('Error', error);
  };

  var displaySignlingMessage = function(message){
    console.log('message', message);
    signalingArea.innerHTML = signalingArea.innerHTML+ '<br/>' + message;
  };

  var displayMessage = function(message){
    chatArea.innerHTML = chatArea.innerHTML+ '<br/>' + message;
  };

  io = io.connect();
  io.emit('ready', {
    chat_room: ROOM,
    signal_room: SIGNAL_ROOM
  });

  io.emit('signal', {
    type: 'user_curr',
    message: 'ready?',
    room: SIGNAL_ROOM
  })


  io.on('accounce', function(data){
    displayMessage(data.message);
  });

  io.on('signaling_message', function(data){
    displaySignlingMessage('Signal received: ' + data.type);
  });

  io.on('message', function(data){
    displayMessage(data.author + ': ' + data.message);
  });

  sendMessage.addEventListener('click', function(event){
    io.emit('send', {
      author: myName.value,
      message: myMessage.value
    });
    event.preventDefault();
  }, false);

}());