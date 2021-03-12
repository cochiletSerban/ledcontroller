module.exports = class Device {
  constructor(state, connection, mac, ip) {
    this.connection = connection, (this.mac = mac), (this.ip = ip), this.state = state;
  }
};
