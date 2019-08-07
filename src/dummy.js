import config from './config.json'

let dummyData = {}
const dataSpec = [
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
}, config.updateInterval)

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

export default dummyData
