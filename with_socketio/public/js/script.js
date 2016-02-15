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
  var SIGNAL_ROOM = 'SIGNAL_ROOM';
  var SIGNAL_TYPE = 'user_here';

  // demo purpose only, this needs to be changed for production use.
  var configuration = {
    'iceServers' : [{
      url: 'stun:stun.l.google.com:19302'
    }]
  };
  var rtcPeerConn;

  var displaySignalingMessage = function(message){
    console.log('message', message);
    signalingArea.innerHTML = signalingArea.innerHTML+ '<br/>' + message;
  };

  var sendLocalDesc = function(desc){
    rtcPeerConn.setLocalDescription(desc, function(){
      displaySignalingMessage('sending local description');
      io.emit('signal', {
        "type":"SDP",
        "message": JSON.stringify({
          'sdp': rtcPeerConn.localDescription
        }),
        "room":SIGNAL_ROOM});
    }, logError);
  };

  var startSignaling = function(){
    displaySignalingMessage('Signaling starts');
    rtcPeerConn = new webkitRTCPeerConnection(configuration);

    // send ice candidates to the other peer
    // ice: Interactive Connectivity Establishment 
    rtcPeerConn.onicecandidate = function(event){
      if (event.candidate){
          io.emit('signal', {
            type: 'ice candidate',
            messgae: JSON.stringify({
              candidate: event.candidate
            }),
            room: SIGNAL_ROOM
          });
          displaySignalingMessage('Singaling completed');
      }
    };

    // send negotiationneeded events trigger offer generation
    rtcPeerConn.onnegotiationneeded = function () {
      displaySignalingMessage('Singaling completed');
      rtcPeerConn.createOffer(sendLocalDesc, logError);
    };

    // add remote video source to
    rtcPeerConn.onaddstream = function(event){
      console.log('add remote video stream');
      displaySignalingMessage('Singaling got remote Stream, lets add it');
      remoteVideo.src = URL.createObjectURL(event.stream);
    }; 

    // start stream after signal is done
    startStream();
  };


  var onSuccess = function(stream) {
    console.log('Success');
    displaySignalingMessage('Signal rtc connection success');
    localVideo.src = window.URL.createObjectURL(stream);
    localVideo.play();
    rtcPeerConn.addStream(stream);
  };

  var logError = function(error){
    displaySignalingMessage(error.name + ': '+ error.message);
  };

  var displayMessage = function(message){
    chatArea.innerHTML = chatArea.innerHTML+ '<br/>' + message;
  };

  var startStream = function() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var constraints = {
      audio: isAudio,
      video: isVideo,
    };

    navigator.getUserMedia(constraints, onSuccess, logError);
  }

  io = io.connect();
  io.emit('ready', {
    chat_room: ROOM,
    signal_room: SIGNAL_ROOM
  });

  io.emit('signal', {
    type: SIGNAL_TYPE,
    message: 'ready?',
    room: SIGNAL_ROOM
  });

  io.on('accounce', function(data){
    displayMessage(data.message);
  });

  io.on('signaling_message', function(data){
    displaySignalingMessage('Signal received: ' + data.type);
    if (!rtcPeerConn) {
      startSignaling();
    }

    if (data.type !== SIGNAL_TYPE){
      var message = JSON.parse(data.message);
      // we are accepting the offer the other party sent
      if (message.sdp) {
        console.log('recieve rtc connection');
        displaySignalingMessage('Signal recieved rtc connection: ' + data.type);

        rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){
          if (rtcPeerConn.remoteDescription.type === 'offer'){
            rtcPeerConn.createAnswer(sendLocalDesc, logError);
          }
        }, logError);
      } else {
        // we create the offer to expect the other party to accept
        console.log('start rtc connection');
        displaySignalingMessage('Signal started rtc connection: ' + data.type);
        rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    }
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