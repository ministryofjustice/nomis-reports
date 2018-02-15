const log = require('../../server/log');

const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);

const formatDate = (d) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}T${d.getHours()}:${d.getMinutes()}`;

const RequestQueue = require('../helpers/RequestQueue');

function ExtractorAgent(req, opts) {
  this.request = req;
  this.list = opts.list;
  this.type = opts.type;
  this.batchSize = opts.batchSize;
  this.detail = opts.detail;

  this.ids = new RequestQueue();
  this.extractDate = formatDate(new Date());
  this.location = `extracts/${this.type}/${this.extractDate}`;
  this.filepath = `./.${this.location}.json`;
}

module.exports = ExtractorAgent;
