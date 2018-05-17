const express = require('express');
const router = new express.Router();

const moment = require('moment');
const helpers = require('../helpers');

const log = require('../../server/log');

const util = require('util');
const fs = require('fs');
const readdir = util.promisify(fs.readdir);

const listExtracts = (req, res, next) => {
  res.status(200).type('json');

  return readdir(`./.extracts/reports/${req.params.type}/`)
    .then(data => res.json(data.map(x => `/extracts/${req.params.type}/${x}`)))
    .catch(helpers.failWithError(res, next));
};

const retrieveExtract = (req, res) => {
  res.status(200).type('json');

  let extractDate = moment(req.params.date).format('YYYYMMDD');
  let stream = fs.createReadStream(`./.extracts/reports/${req.params.type}/${extractDate}.json`);

  stream.on('error', (err) => { log.error(err, 'retrieveExtract ERROR'); });
  stream.on('end', () => { res.end(); });
  stream.on('data', (chunk) => { res.write(chunk); });
};

router.get('/:type/', listExtracts);
router.get('/:type/:date', retrieveExtract);

module.exports = router;
