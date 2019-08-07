import express from 'express'

import bodyParser from 'body-parser'
import config from './config.json'
import logger from 'morgan'
import helmet from 'helmet'

import Mppt60 from './mppt60'

const app = express()

const mppt = new Mppt60('192.168.0.23', 502)
let mpptData
let minimalData = {}
let optimizationLevel = 0

const RETURN_CODE = {
    OK: 'OK',
    NG: 'NG',
    UA: 'UA',
    UW: 'UW',
}

app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(logger('dev'))

const init = () => {
    setInterval(() => {
        mppt.getRawdata()
            .then(rawData => mppt.parseData(rawData))
            .then(data => {
                mpptData = data
                updateMinimalData()
            })

        console.log(minimalData)
    }, 1000)
}

function updateMinimalData() {
    minimalData.charge_state = mpptData.charge_state
    minimalData.battery_voltage = `${mpptData.battery_voltage.toFixed(2)} V`
    minimalData.array_voltage = `${mpptData.array_voltage.toFixed(2)} V`
    minimalData.array_current = `${mpptData.array_current.toFixed(2)} A`
    minimalData.optimizationLevel = `${optimizationLevel}`
}

function getFunctionRouter(req, res) {
    const getData = req.query.getdata
    const setOptimizationLevel = req.query.setoptimizationlevel

    if (getData != undefined) {
        getDataHandler(req, res)
    } else if (setOptimizationLevel != undefined) {
        setOptimizationLevelHandler(req, res)
    } else {
        res.send(RETURN_CODE.UW)
    }
}

function getDataHandler(req, res) {
    res.send(`${RETURN_CODE.OK} ${JSON.stringify(minimalData)}`)
}
function setOptimizationLevelHandler(req, res) {
    const setOptimizationLevel = req.query.setoptimizationlevel
    const optiLevel = Number(setOptimizationLevel)

    if (Number.isInteger(optiLevel) && optiLevel >= 0 && optiLevel <= 10) {
        optimizationLevel = optiLevel
        res.send(`${RETURN_CODE.OK} setoptimizationlevel=${optimizationLevel}`)
    } else {
        res.send(RETURN_CODE.NG)
    }
}

function getHandler(req, res) {
    res.send(JSON.stringify(mpptData))
}

app.get('/', function(req, res) {
    getFunctionRouter(req, res)
})

app.get('/vb.htm', function(req, res) {
    getFunctionRouter(req, res)
})

app.get('/get', function(req, res) {
    getHandler(req, res)
})

app.listen(config.port, function() {
    console.log(`Bona Simulator app listening on port ${config.port}!`)
})

if (require.main === module) {
    init()
}
