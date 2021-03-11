const WebSocket = require('ws');
const DeviceState = require('../models/DeviceState');
const Device = require('../models/Device');

const wss = new WebSocket.Server({ port: 8080 });

const connectedDevices = [];

connectedDevices.push = function pushUniq(...args) {
  if (!this.find((el) => el.mac === args[0].mac)) {
    return Array.prototype.push.apply(this, args);
  }
  console.log('nu bagam ca mai e');
  return this;
};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('received: %s', message);
    const parsedMsg = JSON.parse(message);
    console.log(parsedMsg);
    const msgType = JSON.parse(message)[0];

    if (msgType === 'dvc-con') {
      const device = parsedMsg[1];
      connectedDevices.push(
        new Device(new DeviceState(), device.mac, device.ip),
      );
      console.log(connectedDevices);
    }
  });
});

/*

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
