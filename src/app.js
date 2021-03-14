const WebSocket = require('ws');
const DeviceState = require('../models/DeviceState');
const Device = require('../models/Device');

const wss = new WebSocket.Server({ port: 8080 });

// ////////////// CONNECTION METHODS ////////////// //

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

// ////////////// WSS EVENTS ////////////// //

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
