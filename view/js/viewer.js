const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';
const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';

const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;//Change to the correct one once you change
const STREAM_ID = location.hash.replace("#", "");

//Change to correct id
document.getElementById("user_stream").innerHTML = "You're watching <b>#" + STREAM_ID + "'s</b> stream"
document.getElementById("record_video").id = STREAM_ID;


//Configure GUN to pass to streamer
var peers = ['https://gunmeetingserver.herokuapp.com/gun'];
var opt = { peers: peers, localStorage: false, radisk: false };
var gunDB = Gun(opt);

//Configure GunViewer 
var viewer_config = {
    mimeType: MIME_TYPE_USE,
    streamerId: STREAM_ID,//ID of the streamer
    catchup: false,//Skip to last frame when there is to much loading. Set to false to increase smooth playback but with latency
    debug: false,//For debug logs  
}

var gunViewer = new GunViewer(viewer_config);

//Configure GUN to pass to streamer
var peers = ['https://gunmeetingserver.herokuapp.com/gun'];
var opt = { peers: peers, localStorage: false, radisk: false };
var gunDB = Gun(opt);

// Get data from gun and pass along to viewer
gunDB.get(STREAM_ID).on(function (data) {
    gunViewer.onStreamerData(data);
});
