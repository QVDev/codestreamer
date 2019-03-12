
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

localStorage.clear();
var peers = ['https://livecodegun.herokuapp.com/gun'];
var opt = {peers:peers, localStorage:false, radisk: false};
var gunDB = Gun(opt);

var reader = new FileReader();

function initStream() {
    console.log(streamId);
    liveButton = document.getElementById("live_button")
    liveButton.onclick = startCasting;
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
        }, error => {
            showError(error);
        });
}

function stopStream() {
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

        screenCastVideo.srcObject = mixer.getMixedStream();
        mediaRecorder = new MediaStreamRecorder(screenCastVideo.captureStream());
        mediaRecorder.mimeType = mimeCodec;
        mediaRecorder.ondataavailable = onBlobAvailable;
        mediaRecorder.start(RECORD_TIME);
        document.getElementsByTagName('canvas')[0].hidden = true
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
        writeToGun(base64String.toString());

        var t1 = performance.now();
        console.log("FETCH   to doSomething took " + (t1 - t0) + " milliseconds.");
    }).catch(function (err) {
        console.log(err);
    });


}

function writeToGun(base64data) {
    // var stream = gunDB.get(streamId).put({name: base64data}, ack);
    // stream.get(DB_RECORD).set(stream);
    let lastUpdate = new Date().getTime();
    var user = gunDB.get(streamId).put({name: base64data, id: streamId, timestamp: lastUpdate}, ack);
    gunDB.get(DB_RECORD).set(user);
    localStorage.clear();
    // gunDB.get('stream/' + streamId).put({ name: base64data }, ack);
}

function removeFromGun() {
    localStorage.clear();
    var user = gunDB.get(streamId)
    gunDB.get(DB_RECORD).unset(user);
    user.put(null)
}

function ack(ack) {
    if (ack.ok != 1 && ack.err != "Error: No ACK received yet.") {
        localStorage.clear();
        // console.log(ack);
    } else {
        // console.log(ack)
        localStorage.clear();
    }
}

function stopRecording() {
    removeFromGun();
    mediaRecorder.stop();
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    })

    cameraStream.getTracks().forEach(function (track) {
        track.stop();
    })
}
