const WebSocket = require('ws');
const DeviceState = require('../models/DeviceState');
const Device = require('../models/Device');

const wss = new WebSocket.Server({ port: 8080 });

function makeConnectedDevicesArray() {
  const deviceArray = [];
  deviceArray.push = function pushUniq(...args) {
    if (!this.find((el) => el.mac === args[0].mac)) {
      return Array.prototype.push.apply(this, args);
    }
    console.log('nu bagam ca mai e');
    return this;
  };
  return deviceArray;
}

function populateConnectedDeviceList(connection, req, connectedDevices) {
  const deviceData = JSON.parse(decodeURI(req.url).substr(1));
  const newDevice = {
    mac: deviceData[0],
    ip: deviceData[1],
  };

  return connectedDevices.push(
    new Device(new DeviceState(), connection, newDevice.mac, newDevice.ip),
  );
}

function heartBeat() {
  this.isAlive = true;
}

function handleBrokenConnection(ws) {
  const connection = ws;
  connection.isAlive = true;
  connection.on('pong', heartBeat);
}
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const socket = ws;
    if (socket.isAlive === false) {
      return socket.terminate();
    }
    socket.isAlive = false;
    return socket.ping();
  });
}, 3000);

const connectedDevices = makeConnectedDevicesArray();

// ////////////// WSS EVENTS //////////////////// //

wss.on('connection', (ws, req) => {
  handleBrokenConnection(ws);
  populateConnectedDeviceList(ws, req, connectedDevices);
  console.log(connectedDevices);
});

wss.on('close', () => {
  console.log('close');
  clearInterval(interval);
});

wss.on('unexpected-response', () => {
  console.log('err');
});

// function buildMeSomeSockets(no) {
//   const sockets = [];
//   for (no >= 0; no--;) {

//      const socket = new WebSocket(`ws://localhost:8080/["85:AF:55:85:AF:5${no}","192.168.4.1"]`);
//      socket.numaruMagic = no;
//      sockets.push(socket);
//   }
//   return sockets;
// }

// function addOpenEvListner(sockets) {
//   sockets.forEach(socket=> {
//     socket.addEventListener('open', function (event) {
//       console.log('socket ' + socket.numaruMagic + ' is connected');
//     });
//   })
// }

/*

set interval 2 sec
for each device {
  sennd ping msg
  set is alive false
}
wait 1 sec

for each device {
  if device is not alive
  device.remove && device.terminate connection
}

for each msg = dvc-alive {
  set is alive true
}

["dvc-con",{"mac":"17","ip":13}]

device: {
  Name:"lumina mea nebuna",
  Type:enum (RGB HIPOW G),
  Location: Location (room),
  ip:string / byte arr
  Link: with (device),
  state: {
    power: boolean(on/off),
    rgb: {
      r: byte,
      g: byte,
      b: byte,
    },
    brightness,
    mode: enum ( breath, rainbow, strobe )
  }
}

  get all devices and build device array
  message type
  dvc-con
  fe-con
  fe-dvc
*/
