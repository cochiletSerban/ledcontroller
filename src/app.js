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

function handleBrokenConnection(ws) {
  const connection = ws;
  connection.isAlive = true;

  function heartBeat() {
    this.isAlive = true;
  }

  connection.on('pong', heartBeat);
}

function setPingInterval(pingInterval = 3000, wss) {
  return setInterval(() => {
    wss.clients.forEach((webSocket) => {
      const socket = webSocket;
      if (socket.isAlive === false) {
        console.log('slay them all');
        return socket.terminate();
      }
      socket.isAlive = false;
      return socket.ping();
    });
  }, pingInterval);
}

const connectedDevices = makeConnectedDevicesArray();
const pingInterval = setPingInterval(3000, wss);

// ////////////// WSS EVENTS ////////////// //

wss.on('connection', (ws, req) => {
  handleBrokenConnection(ws, wss);
  populateConnectedDeviceList(ws, req, connectedDevices);
  console.log(connectedDevices);
});

wss.on('close', () => {
  console.log('close');
  clearInterval(pingInterval);
});

wss.on('unexpected-response', () => {
  console.log('err');
});
