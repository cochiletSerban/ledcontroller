const WebSocket = require('ws');
const DeviceState = require('../models/DeviceState');
const Device = require('../models/Device');

const wss = new WebSocket.Server({ port: 8080 });

const connectedDevices = [];

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('received: %s', message);
    connectedDevices.push(new Device(new DeviceState(), 'yolo', '111'));
  });
});

/*
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
*/
