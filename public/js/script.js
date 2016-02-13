(function(){
  var isAudio = true;
  var isVideo = true;
  var localVideo = document.getElementById('localVideo');

  var onSuccess = function(stream){
    console.log('Success');
    localVideo.src = window.URL.createObjectURL(stream);
    localVideo.play();
  };

  var onError = function(error){
    console.log('Error', error);

  };

  navigator.getUserMedia = navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia;
  var constraints = { audio: isAudio, video: isVideo};

  navigator.getUserMedia(constraints, onSuccess, onError);
}());
