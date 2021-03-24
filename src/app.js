const WebSocket = require('ws');
const DeviceState = require('../models/DeviceState');
const Device = require('../models/Device');

const wss = new WebSocket.Server({ port: 8080 });

// ////////////// CONNECTION METHODS ////////////// //

// TODO: move to connection methods module

// function makeConnectedDevicesArray() {
//   const deviceArray = [];
//   deviceArray.push = function pushUniq(...args) {
//     if (!this.find((el) => el.mac === args[0].mac)) {
//       return Array.prototype.push.apply(this, args);
//     }
//     console.log('nu bagam ca mai e');
//     return this;
//   };
//   return deviceArray;
// }

function populateConnectedDeviceList(connection, req, connectedDevices) {
  const deviceData = JSON.parse(decodeURI(req.url).substr(1));
  const con = connection;

  const newDevice = {
    mac: deviceData[0],
    ip: deviceData[1],
  };

  con.mac = newDevice.mac;

  return connectedDevices.set(
    newDevice.mac,
    new Device(new DeviceState(), con, newDevice.mac, newDevice.ip),
  );
}

function handleBrokenConnection(ws) {
  const connection = ws;
  connection.isAlive = true;

  function heartBeat() {
    this.isAlive = true;
  }

  connection.on('pong', heartBeat);
}

function setPingInterval(pingInterval = 3000, wss, connectedDevices) {
  return setInterval(() => {
    wss.clients.forEach((webSocket) => {
      const socket = webSocket;
      if (socket.isAlive === false) {
        console.log('slay them all: ' + socket.mac);
        connectedDevices.delete(socket.mac);
        return socket.terminate();
      }
      socket.isAlive = false;
      return socket.ping();
    });
  }, pingInterval);
}

// ////////////// SETUP ////////////// //

const connectedDevices = new Map();
const pingInterval = setPingInterval(3000, wss, connectedDevices);

// ////////////// WSS EVENTS ////////////// //

wss.on('connection', (ws, req) => {
  handleBrokenConnection(ws, wss);
  if (req.url === '/') {
    console.log('fe connected device');
    ws.send(JSON.stringify(Array.from(connectedDevices.entries())));
    //   const map = new Map(JSON.parse(event.data));
  } else {
    populateConnectedDeviceList(ws, req, connectedDevices);
    console.log('connected device');
  }

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg[0] === 'fe-state') {
      // console.log(msg[1]);
      connectedDevices.delete(msg[1].mac);
      connectedDevices.set(
        msg[1].mac,
        new Device(msg[1].state, msg[1].connection, msg[1].mac, msg[1].ip),
      );
      console.log(connectedDevices.get(msg[1].mac).state);
    }
  });
});

wss.on('close', () => {
  console.log('close');

  clearInterval(pingInterval);
});

wss.on('unexpected-response', () => {
  console.log('err');
});
