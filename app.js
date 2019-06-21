const express = require('express')

const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

dummyData = {
    State: 'CHARGE',
    ArrVoltage: 40.3,
    데이터1: '40032 V',
    SoC: '93 %',
    Optimization: 1,
}

dataSpec = [
    {
        name: 'State',
        value: 'CHARGE',
        isRandom: false,
    },
    {
        name: 'ArrVoltage',
        value: 50,
        min: 50,
        max: 70,
        unit: 'V',
        isRandom: true,
    },
    {
        name: '전력',
        value: 10,
        min: 30,
        max: 50,
        unit: 'W',
        isRandom: true,
    },
    {
        name: 'SoC',
        value: 30,
        min: 30,
        max: 50,
        unit: '%',
        isRandom: true,
    },
    {
        name: 'Optimization',
        value: 0,
        isRandom: false,
    },
]

setInterval(() => {
    dummyData = updatedData(dataSpec)
}, 1000)

function getRandomValue(min, max, decimalPoint) {
    return (Math.random() * (max - min) + min).toFixed(decimalPoint)
}

function updatedData(dataSpec) {
    const data = {}

    dataSpec.map(item => {
        item.value = item.isRandom
            ? getRandomValue(item.min, item.max, 2)
            : item.value

        data[item.name] = `${item.value}${item.unit ? ' ' + item.unit : ''}`
    })

    return data
}

function getDataHandler(req, res) {
    const getData = req.query.getdata
    const setOptimizationLevel = req.query.setoptimizationlevel
    const OK_STRING = 'OK'
    const NG_STRING = 'NG'
    const UA_STRING = 'UA'
    const UW_STRING = 'UW'

    if (getData != undefined) {
        res.send(`${OK_STRING} ${JSON.stringify(dummyData)}`)
    } else if (setOptimizationLevel != undefined) {
        const optimizationLevel = Number(setOptimizationLevel)

        if (
            Number.isInteger(optimizationLevel) &&
            optimizationLevel >= 0 &&
            optimizationLevel <= 10
        ) {
            dataSpec[4].value = optimizationLevel
            res.send(
                `${OK_STRING} setoptimizationlevel=${optimizationLevel}`
            )
        } else {
            res.send(NG_STRING)
        }
    } else {
        res.send(UW_STRING)
    }
}

app.get('/', function(req, res) {
    getDataHandler(req, res)
})

app.get('/vb.htm', function(req, res) {
    getDataHandler(req, res)
})

app.listen(80, function() {
    console.log('Example app listening on port 80!')
})
