//Configure GUN to pass to streamer
const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';
const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';
const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;//Change to the correct one once you change

const STREAM_ID = getID();

function getID() {
    if (location.hash == "") {
        return Math.random().toString(36).substring(2, 8);
    } else {
        return location.hash.replace("#", "");
    }
}

var peers = ['https://livecodestream-us.herokuapp.com/gun','https://livecodestream-eu.herokuapp.com/gun'];
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