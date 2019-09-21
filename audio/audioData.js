const DB_RECORD_META = 'gunmeeting_audiodata'
let USER_METADATA = 'audiodata_' + STREAM_ID;

function sentMessage() {
    var input = document.getElementById("message");
    sentControlData({ text: input.value });
    input.value = "";
}

function sentControlData(data) {
    data.streamId = STREAM_ID;
    let metaData = gunDB.get(USER_METADATA).put(data);
    gunDB.get(DB_RECORD_META).set(metaData);
}

//Listen on startup
receiveData();
function receiveData() {

    gunDB.get(DB_RECORD_META).map().on(function (data, id) {
        if (!data) {
            return
        }
        /* EVENT HANDLER */
        if (data.audio && data.streamId != STREAM_ID) {
            AudioApi.playStream(data.audio);
        }
    });
}

function SETCLUE(cue, element, hide) {
    if (element) {
        var video = document.getElementById(element);
    } else {
        var video = document.getElementById("record_video");
    }
    if (hide) HIDETRACKS(element);
    if (cue == 0) return;
    if (!video) return;
    var track = video.addTextTrack("captions", "English", "en");
    if (!track) return;
    var time = parseInt(video.currentTime);
    track.mode = "showing";
    // track.addCue(new VTTCue(0, 99999, cue|| "..." ));
    track.addCue(new VTTCue(time, time + 2, cue || "..."));
};

function HIDETRACKS(element) {
    if (element) {
        var video = document.getElementById(element);
    } else {
        var video = document.getElementById("record_video");
    }
    if (!video) return;
    if (!video.textTracks) return;
    // Oddly, there's no way to remove a track from a video, so hide them instead
    for (i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = "hidden";
    }
};