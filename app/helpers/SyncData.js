const fs = require('fs');
const moment = require('moment');

function SyncData(filepath) {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, "{}");
  }

  this.filepath = filepath;

  this.load();
}

SyncData.load = function createSyncData(filepath) {
  return new SyncData(filepath);
};

SyncData.prototype.load = function loadSyncData() {
  function jsonReviver(key, value) {
    if (typeof value === "string") {
      let m = moment(value, moment.ISO_8601);
      if (m.isValid()) {
        return m;
      }
    }

    return value;
  };

  this.data = JSON.parse(fs.readFileSync(this.filepath, 'utf8'), jsonReviver);
};

SyncData.prototype.get = function getLastSync(property) {
  return this.data[property].clone();
};

SyncData.prototype.set = function getLastSync(property, value) {
  let m = moment(value);
  if (this.data[property].diff(m) < 0) {
    this.data[property] = m;

    fs.writeFileSync(this.filepath, JSON.stringify(this.data));
  }

  return this;
};

module.exports = SyncData;
