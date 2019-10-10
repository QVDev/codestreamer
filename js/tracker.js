const ANALYTICSROOT = "analytics";
var analyticsChart;
var gun;

window.onload = function () {
    initChart();
    initDatabase()
    if (typeof VIEW_ONLY === 'undefined') {
        addVisitor()
    }
}

window.addEventListener("unload", function () {
    if (typeof VIEW_ONLY === 'undefined') {
        removeVisitor();
    }
});

function initChart() {
    if (typeof VIEW_ONLY !== 'undefined') {
        var ctx = document.getElementById('analytics');
        analyticsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    label: "Visitors",
                    borderColor: "#3e95cd",
                    fill: false
                }]
            },
            options: {
                responsive: false
            }
        });
    }
}

function addData(data) {
    if (typeof VIEW_ONLY !== 'undefined') {
        analyticsChart.data.labels.push(getDateTime());
        analyticsChart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });
        analyticsChart.update();
    }
}

function initDatabase() {
    var peers = ['https://gunmeetingserver.herokuapp.com/gun'];
    var opt = { peers: peers, localStorage: false, radisk: false };
    gun = Gun(opt);

    gun.get(ANALYTICSROOT).get(location.origin).not(function (key) {
        gun.get(ANALYTICSROOT).get(location.origin).put(0)
    });

    gun.get(ANALYTICSROOT).get(location.origin).on(function (data, key) {
        addData(data);
    })
}

function addVisitor() {
    gun.get(ANALYTICSROOT).get(location.origin).once(function (data, key) {
        data += 1;
        gun.get(ANALYTICSROOT).get(location.origin).put(data);
    })
}

function removeVisitor() {
    gun.get(ANALYTICSROOT).get(location.origin).once(function (data, key) {
        data -= 1;
        gun.get(ANALYTICSROOT).get(location.origin).put(data)
    })
}

function getDateTime() {
    var d = new Date();
    var dateTime = d.toLocaleTimeString();
    return dateTime;
}

function getPathName() {
    return location.pathname.substring(1, location.pathname.indexOf('.'));
}