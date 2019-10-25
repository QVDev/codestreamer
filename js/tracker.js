const ANALYTICSROOT = "analytics_livecode";
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
                    borderColor: "#ff6384",
                    fill: false
                }, {
                    data: [],
                    label: "/",
                    borderColor: "#cc65fe",
                    fill: false
                }, {
                    data: [],
                    label: "/studio/",
                    borderColor: "#ffce56",
                    fill: false
                }
                ]
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
            if (dataset.label == "Visitors") {
                dataset.data.push(data.count);
            }

            if (dataset.label == data.path) {
                dataset.data.push(data.count);
            } else if (dataset.label !== "Visitors") {
                dataset.data.push(dataset.data[dataset.data.length - 1])
            }
        });
        analyticsChart.update();
    }
}

function initDatabase() {
    var peers = ['https://livecodestream-us.herokuapp.com/gun','https://livecodestream-eu.herokuapp.com/gun'];
    var opt = { peers: peers, localStorage: false, radisk: false };
    gun = Gun(opt);

    gun.get(ANALYTICSROOT).get(location.origin).not(function (key) {
        gun.get(ANALYTICSROOT).get(location.origin).put(constructData(0))
    });

    gun.get(ANALYTICSROOT).get(location.origin).on(function (data, key) {
        addData(data);
    })
}

function addVisitor() {
    gun.get(ANALYTICSROOT).get(location.origin).once(function (data, key) {
        data.count += 1;
        gun.get(ANALYTICSROOT).get(location.origin).put(constructData(data.count));
    })
}

function removeVisitor() {
    gun.get(ANALYTICSROOT).get(location.origin).once(function (data, key) {
        if (data.count > 0) {
            data.count -= 1;
            gun.get(ANALYTICSROOT).get(location.origin).put(constructData(data.count))
        }
    })
}

function getDateTime() {
    var d = new Date();
    var dateTime = d.toLocaleTimeString();
    return dateTime;
}

function getPathName() {
    return location.pathname;
}

function constructData(data) {
    return {
        path: getPathName(),
        count: data
    }
}

function reset() {
    analyticsChart.data.datasets.forEach((dataset) => {
        if (dataset.label !== "Visitors") {
            gun.get(ANALYTICSROOT).get(location.origin).put(
                {
                    path: dataset.label,
                    count: 0
                }
            )
        }
    });
}