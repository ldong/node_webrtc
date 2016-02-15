(function() { 
  var isAudio = false;
  var isVideo = true;
  var localVideo = document.getElementById('localVideo');
  var videoSource = document.getElementById('camera');

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
      video: {
        mandatory: {
          maxWidth: 640,
          maxHeight: 640,
          minHeight: 360,
          maxHeight: 480
        },
        optiona: [{
            sourceId: videoSource
          }
        ]
      }
    };

    navigator.getUserMedia(constraints, onSuccess, onError);
  }

  var onSuccess = function(stream) {
    console.log('Success');
    localVideo.src = window.URL.createObjectURL(stream);
    localVideo.className = 'grayscale_filter';
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
  startStream();

  var snapshotButton = document.getElementById('snapshot');
  var profilePicture = document.getElementById('profilePicture'); // canvas
  var profilePictureOutput = document.getElementById('profilePictureOutput');

  var width = 640;   // desired width of the profile picture
  var ratio = 4.0/3; // desired ratio
  var height = 0;    // calculated height
  var streaming = false; // used to determine whether video has loaded

  snapshotButton.addEventListener('click', function(event){
    takeProfilePicture(profilePicture, profilePictureOutput);
    event.preventDefault();
  });

  localVideo.addEventListener('canplay', function(event){
    event.preventDefault();

    if(!streaming){
      height = localVideo.videoHeight / (localVideo.videoHeight / width);
      if (isNaN(height)) {
          height = width / ratio;
      }

      localVideo.setAttribute('width', width);
      localVideo.setAttribute('height', height);

      profilePicture.setAttribute('width', width);
      profilePicture.setAttribute('height', height);

      streaming = true;
    }
  }, false);

  function takeProfilePicture(canvasSource, imageSource){
      var context = canvasSource.getContext('2d');
      if (width && height) {
        canvasSource.width = width;
        canvasSource.hegiht = height;
        context.drawImage(localVideo, 0, 0, width, height);
        var data = canvasSource.toDataURL('image/png');
        imageSource.setAttribute('src', data);
      }
  }
}());