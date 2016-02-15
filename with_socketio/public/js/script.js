(function() { 
  var isAudio = false;
  var isVideo = true;
  var localVideo = document.getElementById('localVideo');
  var videoSource = document.getElementById('camera');

  var myName = document.getElementById('myName');
  var myMessage = document.getElementById('myMessage');
  var sendMessage = document.getElementById('sendMessage');
  var chatArea = document.getElementById('chatArea');
  var ROOM = 'CHAT';

  function getCameras(sourceInfos) {
    for (var i=0; i< sourceInfos.length; ++i) {
      var sourceInfo = sourceInfos[i];
      var option = document.createElement('option');
      option.value = sourceInfo.id;
      if (sourceInfo.kind === 'video') {
        option.text = sourceInfo.label || 'camera ' + (videoSource.length + 1);
        videoSource.appendChild(option);
      }
    }
  };

  var startStream = function() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints = {
      audio: isAudio,
      video: isVideo
    };

    navigator.getUserMedia(constraints, onSuccess, onError);
  }

  var onSuccess = function(stream) {
    console.log('Success');
    localVideo.src = window.URL.createObjectURL(stream);
    localVideo.play();
  };

  var onError = function(error) {
    console.log('Error', error);

  };

  // MediaStreamTrack.getSources is deprecated
  var getMediaStreamTrack = function(callback) {
    if (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources === 'undefined') {
      document.querySelector('#cameraSelector').style.visibility = 'hidden';
    } else {
      MediaStreamTrack.getSources(callback);
    }
  }
  videoSource.onchange = startStream;
  getMediaStreamTrack(getCameras);
  
  // startStream();

  var displayMessage = function(message){
      chatArea.innerHTML = chatArea.innerHTML+ '<br/>' + message;
  };

  io = io.connect();
  io.emit('ready', ROOM);
  io.on('accounce', function(data){
    displayMessage(data.message);
  });

}());