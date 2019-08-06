import Modbus from 'jsmodbus'
import net from 'net'

const socket = new net.Socket()
const client = new Modbus.client.TCP(socket, 1)

let isConnect = false
class Mppt60 {
    constructor(host, port = 502) {
        const options = {
            host: host,
            port: port,
        }

        socket.on('connect', async function() {
            console.log('Connecting succes')
            isConnect = true
        })
        socket.connect(options)
    }

    async getRawdata() {
        const rawDatas = {}

        const result = await Promise.all([
            client.readHoldingRegisters(0x0, 4),
            client.readHoldingRegisters(0x1b, 3),
            client.readHoldingRegisters(0x23, 5),
            client.readHoldingRegisters(0x32, 2),
            client.readHoldingRegisters(0x3a, 5),
            client.readHoldingRegisters(0xe082, 6),
        ])
        result.forEach(element => {
            const {
                response: {
                    body: { values },
                },
                request: {
                    body: { start, count },
                },
            } = element
            values.map((value, idx) => {
                rawDatas[start + idx] = value
            })
        })
        return rawDatas
    }

    parseData(rawDatas) {
        const CHARGE_STATE = [
            'STRAT',
            'NIGHT_CHECK',
            'DISCONNET',
            'NIGHT',
            'FAULT',
            'MPPT',
            'ABSORPTION',
            'FLOAT',
            'EQUALIZE',
            'SLAVE',
        ]

        const datas = {}
        const v_pu = rawDatas[0x0]
        const i_pu = rawDatas[0x2]

        datas.array_voltage = rawDatas[0x1b] * v_pu * 2 ** -15
        datas.array_current = rawDatas[0x1d] * i_pu * 2 ** -15

        datas.heatsink_temp = rawDatas[0x23]
        datas.battery_temp = rawDatas[0x25]
        datas.battery_voltage = rawDatas[0x26] * v_pu * 2 ** -15
        datas.charge_current = rawDatas[0x27] * i_pu * 2 ** -15

        datas.charge_state = CHARGE_STATE[rawDatas[0x32]]
        datas.target_voltage = rawDatas[0x33] * v_pu * 2 ** -15

        datas.output_power = rawDatas[0x3a] * v_pu * i_pu * 2 ** -17
        datas.sweep_pmax = rawDatas[0x3c] * v_pu * i_pu * 2 ** -17
        datas.sweep_vmp = rawDatas[0x3d] * v_pu * 2 ** -15
        datas.sweep_voc = rawDatas[0x3e] * v_pu * 2 ** -15

        datas.amp_hours = (rawDatas[0xe082] * 65536 + rawDatas[0xe083]) * 0.1
        datas.kw_hours = rawDatas[0xe086]

        return datas
    }
}

if (require.main === module) {
    const mppt = new Mppt60('192.168.0.23', 502)
    let d

    setInterval(() => {
        if (isConnect) {
            mppt.getRawdata()
                .then(rawData => mppt.parseData(rawData))
                .then(data => {
                    d = data
                })

            console.log(d)
        } else {
            console.log('not connect')
        }
    }, 1000)
}
