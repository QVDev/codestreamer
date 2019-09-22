
STREAM_ID = Math.random().toString(36).substring(2, 8);

//Configure GUN to pass to streamer
var peers = ['https://gunmeetingserver.herokuapp.com/gun'];
var opt = { peers: peers, localStorage: false, radisk: false };
var gunDB = Gun(opt);
let recorderStream

let AudioApi = (() => {

    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);


    let
        channels = 1,
        BUFF_SIZE = 2048,
        samplingRate = 48000,
        frameSize = 9600


    var session = {
        audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            sampleRate: 22050,
            channelCount: 1
        },
        video: false
    };

    let
        recorder_context = null,
        player_context = null

    function initializeRecorder(stream) {
        recorderStream = stream;
        recorderStream.getAudioTracks()[0].enabled = false;
        var audioContext = window.AudioContext;
        recorder_context = new audioContext();
        var audioInput = recorder_context.createMediaStreamSource(stream);
        var recorder = recorder_context.createScriptProcessor(BUFF_SIZE, 1, 1);
        recorder.onaudioprocess = onRecordData;
        audioInput.connect(recorder);
        recorder.connect(recorder_context.destination);
    }



    function onRecordData(e) {
        var int16 = convertFloat32ToInt16(e.inputBuffer.getChannelData(0))
        var string = ab2str(int16);
        LISTENER.onNewPayload(
            string
        )
    }


    // convert the buffer to float32
    function convertFloat32ToInt16(buffer) {
        let l = buffer.length;
        let buf = new Int16Array(l);
        while (l--) {
            buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
        }
        return buf.buffer;
    }

    // inputArray is the array buffer
    // first convert the array buffer to in16
    // then we need to conver the int16 to float32
    // return float32array
    function int16ToFloat32(inputArray) {

        let int16arr = new Int16Array(inputArray)
        var output = new Float32Array(int16arr.length);
        for (var i = 0; i < int16arr.length; i++) {
            var int = int16arr[i];
            var float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
            output[i] = float;
        }
        return output;
    }

    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }


    // the buff is the array buffer
    // this buff need to be converted to float32
    function makeSomeNoise(buff) {
        if (player_context == null)
            player_context = new window.AudioContext()
        var buffer = player_context.createBuffer(channels, frameSize, samplingRate)
        var int32 = str2ab(buff);
        buffer.getChannelData(0).set(int16ToFloat32(int32)) // set the buffe to the channel
        var source = player_context.createBufferSource() // create a buffer source
        source.buffer = buffer
        source.connect(player_context.destination)
        source.start()

    }


    function onError(e) {
        console.log("onError", e)
    }


    function startToRecord(listener) {
        LISTENER = listener
        navigator.getUserMedia(session, initializeRecorder, onError);
    }

    function playStream(buff) {
        makeSomeNoise(buff)
    }


    function terminate() {

    }





    return {
        startToRecord,
        playStream,
        terminate
    }


})()