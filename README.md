# WebRTC

Author: Lin Dong

Date: Sat Feb 15th, 2016


## What this repo is

This is me exploring WebRTC on Chrome, by learning from *O'Reilly - Introduction to WebRTC*


## Instruction

```bash
npm install
npm start
```

## Resolutions

| Width | Height | Aspect Ratio|
| ------| -------| ------------|
| 1280  |720     |16:9         |
| 960   |720     |4:3          |
| 640   |360     |16:9         |
| 640   |480     |4:3          |
| 320   |240     |4:3          |
| 320   |180     |16:9         |


## RTCDataChannel Overview
Data Channels:

1. Reliable: `{ordered: true}`
2. Unreliable: `{ordered: false}`
3. More options

  ```
  {
    ordered: true/false,
    maxRetransmitTime: milliseconds,
    maxRetransmits: maximum number of times to retry,
    protocol: other than SCTP,
    negotiated: true keeps WebRTC from setting up a channel on other side,
    id: provde your own id
  }
  ```

# Useful Resource

1. [getUserMedia.js](https://github.com/addyosmani/getUserMedia.js/):
getUserMedia.js is a cross-browser shim for the getUserMedia() API (a part of
WebRTC)
2. Socket.IO
3. FAYE: Pub/Sub
4. [Getting Started with WebRTC - HTML5 Rocks](http://www.html5rocks.com/en/tutorials/webrtc/basics/)
5. [WebRTC in the real world: STUN, TURN and signaling](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/)