setInterval(function () {
    getStats();
}, 1000 * 5);

function getStats() {
    const url = 'https://gunmeetingserver.herokuapp.com/gun/stats.radata';
    fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            console.log(data.peers.count);
            document.getElementById("stream_count").innerHTML = "&nbsp;and has " + data.peers.count + " viewers";
        })
        .catch(function (error) {
            console.log("We got an error::" + error);
        });
}