class Message {
  constructor() {
    return this;
  }

  address(address) {
    this.address = address;
    return this;
  }

  timestamp() {
    this.timestamp = Date.now();
    return this;
  }

  text(msg) {
    this.text = msg;
    return this;
  }
}

module.exports = Message;
