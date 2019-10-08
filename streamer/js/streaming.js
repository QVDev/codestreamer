const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';
const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';

const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;//Change to the correct one once you change
const STREAM_ID = getID();
showId();

function showId() {
    document.getElementById("user_stream").innerHTML = "<b>#" + STREAM_ID + "</b>"
}

function getID() {
    if (location.hash == "") {
        return Math.random().toString(36).substring(2, 8);
    } else {
        return location.hash.replace("#", "");
    }
}
//Config for camera recorder
const CAMERA_OPTIONS = {
    video: {
        width: 1280,
        height: 720,
        facingMode: "environment",
        frameRate: 24
    }, audio: true
}

//Configure GUN to pass to streamer
var peers = ['https://gunmeetingserver.herokuapp.com/gun'];
var opt = { peers: peers, localStorage: false, radisk: false };
var gunDB = Gun(opt);

//Config for the GUN GunStreamer
var streamer_config = {
    dbRecord: "gunmeeting",//The root of the streams
    streamId: STREAM_ID,//The user id you wanna stream  
    gun: gunDB,//Gun instance
    debug: false,//For debug logs    
    url: "https://cdn.jsdelivr.net/gh/QVDev/GunStreamer@0.0.8/js/parser_worker.js"//webworker load remote
}

//GUN Streamer is the data side. It will convert data and write to GUN db
const gunStreamer = new GunStreamer(streamer_config)

//This is a callback function about the recording state, following states possible
// STOPPED: 1¸
// RECORDING:2
// NOT_AVAILABLE:3
// UNKNOWN:4
var onRecordStateChange = function (state) {
    var recordButton = document.getElementById("record_button");
    switch (state) {
        case recordSate.RECORDING:
            recordButton.innerText = "End the livestream";
            break;
        default:
            recordButton.innerText = "Press here to go live";
            if (recordedChunks.length > 0) {
                downloadRecording();
            }
            break;
    }
}

var recorder_config = {
    mimeType: MIME_TYPE_USE,
    video_id: "record_video",//Video html element id
    onDataAvailable: onDataAvailable,//MediaRecorder data available callback
    onRecordStateChange: onRecordStateChange,//Callback for recording state
    recordInterval: 800,//Interval of the recorder higher will increase delay but more buffering. Lower will not do much. Due limitiation of webm
    cameraOptions: CAMERA_OPTIONS,//The camera and screencast options see constant
    debug: false//For debug logs
}

var recordedChunks = [];

function onDataAvailable(data) {
    recordedChunks.push(data.data);
    gunStreamer.onDataAvailable(data);
}

function downloadRecording() {
    var blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'test.webm';
    a.click();
    window.URL.revokeObjectURL(url);
}


//Init the recorder
const gunRecorder = new GunRecorder(recorder_config);