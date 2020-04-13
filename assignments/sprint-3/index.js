$(() => {
    let covidData = null

    //const url = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
    const url = "data.csv"
    $.get(url, (data) => {
        covidData = parseCSV(data)
        loadStateData(covidData, $("#stateSelect").val())
    })

    $("#stateSelect").on("change", () => {
        loadStateData(covidData, $("#stateSelect").val())
    })
})

function parseCSV(csv) {
    let covidData = []
    const lines = csv.split(/\r\n|\n/)
    lines.shift()
    lines.forEach(line => {
        let lineSplit = line.split(",")
        covidData.push({
            date: lineSplit[0],
            state: lineSplit[1],
            fips: lineSplit[2],
            cases: lineSplit[3],
            deaths: lineSplit[4]
        })
    })
    return covidData
}

function loadStateData(covidData, state) {
    let stateData = []
    covidData.forEach(entry => {
        if(entry.state == state)
            stateData.push(entry)
    })
    
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: "Simple Line Chart"
        },
        axisY:{
            includeZero: false
        },
        data: [{        
            type: "line",
              indexLabelFontSize: 16,
            dataPoints: [
                { y: 450 },
                { y: 414},
                { y: 520, indexLabel: "\u2191 highest",markerColor: "red", markerType: "triangle" },
                { y: 460 },
                { y: 450 },
                { y: 500 },
                { y: 480 },
                { y: 480 },
                { y: 410 , indexLabel: "\u2193 lowest",markerColor: "DarkSlateGrey", markerType: "cross" },
                { y: 500 },
                { y: 480 },
                { y: 510 }
            ]
        }]
    });
    chart.render();
}