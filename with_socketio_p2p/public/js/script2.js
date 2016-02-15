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
  var STUN_URL = 'stun:stun.l.google.com:19302';

  // demo purpose only, this needs to be changed for production use.
  var configuration = {
    'iceServers' : [{
      url: STUN_URL
    }]
  };
  var rtcPeerConn;
  var dataChannel;
  var dataChannelOptions = {
    ordered: false, 
    maxRetransmitTime: 1000, // in ms
  };

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


  var receiveDataChannelMessage = function(event) {
    displaySignalingMessage('Got an incoming message');
    displayMessage('From DataChannel: '+ event.data);
  }


  var dataChannelStateChanged = function(){
    if (dataChannel.readState === 'open'){
        displaySignalingMessage('Data Channel open');
        dataChannel.onmessage = receiveDataChannelMessage;
    }
  };

  var receiveDataChannel = function(event){
      displaySignalingMessage('Recieving a data channel');
      dataChannel = event.channel;
      dataChannel.onmessage = receiveDataChannelMessage;
  };

  var startSignaling = function(){
    displaySignalingMessage('Signaling starts');

    rtcPeerConn = new webkitRTCPeerConnection(configuration, null);
    dataChannel = rtcPeerConn.createDataChannel('textMessages', dataChannelOptions);

    dataChannel.onopen = dataChannelStateChanged;
    rtcPeerConn.ondatachannel = receiveDataChannel;

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
      video: {
        mandatory: {
          minWidth: 320,
          maxWidth: 320,
          minHeight: 180,
          maxHeight: 180
        }
      },
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

    dataChannel.send(myName.value + ' says '+ myMessage.value);

    event.preventDefault();
  }, false);

  

}());