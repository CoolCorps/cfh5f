$(() => {
    let covidData = null

    const url = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
    //const url = "data.csv"
    $.get(url, (data) => {
        covidData = parseCSV(data)
        loadStateData(covidData, $("#stateSelect").val())
    })

    $("#stateSelect").on("change", () => {
        loadStateData(covidData, $("#stateSelect").val())
    })

    $("#logcheckbox").on("change", () => {
        loadStateData(covidData, $("#stateSelect").val())
    })
})

function parseCSV(csv) {
    let covidData = []
    const lines = csv.split(/\r\n|\n/)
    lines.shift()
    lines.forEach(line => {
        let lineSplit = line.split(",")
        let date = lineSplit[0].split("-")
        let dateObject = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]))
        covidData.push({
            date: dateObject,
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

    let dataPoints = []
    stateData.forEach(entry => {
        dataPoints.push({
            x: entry.date,
            y: parseInt(entry.cases)
        })
    })
    
    var chart = new CanvasJS.Chart("chart", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: "Covid-19 cases in " + state
        },
        axisX:{
            valueFormatString: "MMM D"
        },
        axisY:{
            logarithmic: $("#logcheckbox").is(":checked")
        },
        data: [{        
            type: "line",
            dataPoints: dataPoints
        }]
    });
    chart.render();
}