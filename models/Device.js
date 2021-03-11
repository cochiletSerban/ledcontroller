module.exports = class Device {
  constructor(state, mac, ip) {
    (this.mac = mac), (this.ip = ip), this.state = state;
  }
};
