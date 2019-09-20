//Remove the time info box
document.getElementsByClassName("info-box")[0].remove()

//Add buttons to controls
{/* <a href="https://gunmeeting.herokuapp.com" target="_blank">
<button type="button" class="button success">Visit Viewer as other see it</button>
</a> */}
var buttonShare = document.createElement("button");
buttonShare.className = "button success";
buttonShare.innerHTML = "Visit Viewer as other see it"
buttonShare.style.backgroundColor = "#60a917";
buttonShare.style.outlineColor = "#adeb6e";
buttonShare.style.color = "#fff";
buttonShare.type = "button";
buttonShare.style.order = "8";
buttonShare.onclick = function () { share() };

document.getElementsByClassName("controls")[0].appendChild(buttonShare);// Append to controls

{/* <button id="record_button" class="button alert" type="button" onclick="gunRecorder.record()"></button> */ }
var buttonLive = document.createElement("button");
buttonLive.id = "record_button";
buttonLive.className = "button alert";
buttonLive.style.backgroundColor = "#ce352c";
buttonLive.style.color = "#fff";
buttonLive.style.outlineColor = "#ecaba7";
buttonLive.style.order = "1";
buttonLive.style.display = "block";
buttonLive.style.position = "relative";
buttonLive.type = "button";
buttonLive.onclick = function () { gunRecorder.record() };

document.getElementsByClassName("controls")[0].appendChild(buttonLive);// Append to controls

function share() {
    window.open(location.href + "view/#" + STREAM_ID, '_blank');
}
