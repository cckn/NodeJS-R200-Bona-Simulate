import Modbus from 'jsmodbus'
import net from 'net'

const socket = new net.Socket()
const client = new Modbus.client.TCP(socket, 1)

const options = {
    host: '192.168.0.23',
    port: 502,
}
// for reconnecting see node-net-reconnect npm module

// use socket.on('open', ...) when using serialport
socket.on('connect', async function() {
    // make some calls

    const result = await Promise.all([
        client.readHoldingRegisters(0, 13),
        client.readHoldingRegisters(44, 13),
        client.readHoldingRegisters(22, 13),
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
        console.log(start, count, values)
    })
    console.log(result[1])
})

socket.connect(options)

if (require.main === module) {
}
