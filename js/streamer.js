let switchButton;
let castButton;
let liveButton;

let screenCastVideo;
var currentTorrentId;

var cameraStream;
var screenStream;
var mixer;

var lastCastId;

var listening = false;

var mediaRecorder;
var mimeCodec = 'video/webm; codecs="opus,vp8"';

var mediaSource = new MediaSource();
var sourceBuffer;

var reader = new FileReader();

function initStream() {
    console.log(streamId);
    // switchButton = document.getElementById("switch_screen_button")
    // switchButton.onclick = startScreenShare;

    liveButton = document.getElementById("live_button")
    liveButton.onclick = startCasting;

    // shareButton = document.getElementById("share_button")
    // shareButton.onclick = share;

    screenCastVideo = document.getElementById("screen_cast_video");
}

function share() {
    window.open(location.host + "/viewer.html#" + streamId, '_blank');
}

function startCasting() {
    startCameraShare();
    startScreenShare();
}

function startScreenShare() {
    const screenCastConstraints = {
        video: {
            width: { max: 640, ideal: 640 },
            height: { max: 400, ideal: 400 },
            aspectRatio: { ideal: 1.7777777778 }
        }
    };
    navigator.mediaDevices.getDisplayMedia(screenCastConstraints)
        .then(stream => {
            screenStream = stream;
            startRecording();
            setLiveButton("casting");
        }, error => {
            showError(error);
            setLiveButton("error");
        });
}

function setLiveButton(state) {
    switch (state) {
        case "casting":
            liveButton.innerHTML = "GO OFFLINE"
            liveButton.onclick = stopStream;
            break;
        default:
            liveButton.innerHTML = "GO LIVE"
            liveButton.onclick = startCasting;
            break;
    }
}

function setScreenShareButton(state) {
    // switch (state) {
    //     case "casting":
    //         switchButton.disabled = false;
    //         break;
    //     default:
    //         switchButton.disabled = true;
    //         break;
    // }
}

function startCameraShare() {
    const cameraCastConstraints = {
        video: {
            width: { max: 160, ideal: 160 },
            height: { max: 100, ideal: 100 },
            aspectRatio: { ideal: 1.7777777778 }
        },
        audio: {
            sampleRate: 22000,
            sampleSize: 8,
            channelCount: 2,
            latency: 1000
        }
    };
    navigator.mediaDevices.getUserMedia(cameraCastConstraints)
        .then(stream => {
            cameraStream = stream;
            startRecording();
            setCastButton("casting");
        }, error => {
            showError(error);
            setCastButton("error");
        });
}

function setCastButton(state) {
    // switch (state) {
    //     case "casting":
    //         castButton.innerHTML = "Stop Casting"
    //         castButton.onclick = stopStream;
    //         break;
    //     default:
    //         castButton.innerHTML = "Start Casting"
    //         castButton.onclick = startCasting;
    //         break;
    // }
}

function stopStream() {
    // setScreenShareButton("");
    // setCastButton("");
    setLiveButton("")
    stopRecording();
    screenCastVideo.srcObject = null;
    mediaRecorder = null;
    screenStream = null;
    cameraStream = null;
}

function showError(error) {
    console.log("Unable to capture", error);
}

function startRecording() {
    if (screenStream && cameraStream && !mediaRecorder) {
        resizeScreenStream();
        resizeCameraStream();

        mixer = new MultiStreamsMixer([screenStream, cameraStream]);
        mixer.frameInterval = 1;
        mixer.startDrawingFrames();

        mediaRecorder = new MediaStreamRecorder(mixer.getMixedStream());
        screenCastVideo.srcObject = mixer.getMixedStream();
        mediaRecorder.mimeType = mimeCodec;
        mediaRecorder.ondataavailable = onBlobAvailable;
        mediaRecorder.start(450);
    }
}

function resizeScreenStream() {
    screenStream.fullcanvas = true;
    screenStream.width = window.innerWidth;
    screenStream.height = window.innerHeight;
}

function resizeCameraStream() {
    cameraStream.width = parseInt((20 / 100) * screenStream.width);
    cameraStream.height = parseInt((20 / 100) * screenStream.height);
    cameraStream.top = screenStream.height - cameraStream.height;
    cameraStream.left = screenStream.width - cameraStream.width;
}

function onBlobAvailableOld(blob) {
    var t0 = performance.now();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
        var t1 = performance.now();
        console.log("Reader to doSomething took " + (t1 - t0) + " milliseconds.");
        base64data = reader.result;
        var blobToSend = base64data.replace('data:video/webm; codecs="opus,vp8";base64,', '');
        writeToGun(blobToSend);
    }
}

function onBlobAvailable(blob) {
    var t0 = performance.now();
    var url = URL.createObjectURL(blob);

    fetch(url).then(function (response) {
        return response.arrayBuffer();
    }).then(function (arrayBuffer) {
        URL.revokeObjectURL(url);
        // let base64String = btoa(String.fromCharCode(...new Uint8Array(data)));
        var base64String = btoa(
            new Uint8Array(arrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        writeToGun(base64String);

        var t1 = performance.now();
        console.log("FETCH   to doSomething took " + (t1 - t0) + " milliseconds.");
    }).catch(function (err) {
        console.log(err);
    });


}

function onBlobAvailableImproved(blob) {
    var t0 = performance.now();
    var url = URL.createObjectURL(blob);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
            return;
        }
        // console.log('xhr.status is: ' + xhr.status);
        // console.log('returned content-type is: ' + xhr.getResponseHeader('Content-Type'));
        // console.log('returned content-length is: ' + xhr.getResponseHeader('Content-Length'));

        //   var returnedBlob = new Blob([xhr.response], {type: 'image/png'});
        URL.revokeObjectURL(url);
        var base64String = btoa(
            new Uint8Array(xhr.response)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        // let base64String = btoa(String.fromCharCode(...new Uint8Array(xhr.response)));

        // console.log(base64String);
        writeToGun(base64String);
        var t1 = performance.now();
        console.log("XHR    to doSomething took " + (t1 - t0) + " milliseconds.");
    }
    xhr.send();
}

function writeToGun(base64data) {
    gun.get('stream/' + streamId).put({ name: base64data }, ack);
}

function ack(ack) {
    if (ack.ok != 1 && ack.err != "Error: No ACK received yet.") {
        localStorage.clear();
        console.log(ack);
    }
}

function stopRecording() {
    mediaRecorder.stop();
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    })

    cameraStream.getTracks().forEach(function (track) {
        track.stop();
    })
}
