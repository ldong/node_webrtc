(function(){
  var isAudio = false;
  var isVideo = true;
  var localVideo = document.getElementById('localVideo');

  var onSuccess = function(stream){
    console.log('Success');
    localVideo.src = window.URL.createObjectURL(stream);
    localVideo.className = 'grayscale_filter';
    localVideo.play();
  };

  var onError = function(error){
    console.log('Error', error);

  };

  navigator.getUserMedia = navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia;

  var constraints = {
    audio: isAudio,
    video: {
      mandatory: {
        maxWidth: 640,
        maxHeight: 640,
        minHeight: 360,
        maxHeight: 480
      }
    }
  };

  navigator.getUserMedia(constraints, onSuccess, onError);
}());
