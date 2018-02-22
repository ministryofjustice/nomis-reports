const express = require('express');
const router = new express.Router();

const log = require('../../server/log');

const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);

const BookingService = require('../services/BookingService');
const ExtractorAgent = require('../helpers/ExtractorAgent');

const services = {};
let setUpServices = (config) => {
  services.booking = services.booking || new BookingService(config);
  services.bookingExtracts = services.bookingExtracts || new ExtractorAgent({ type: 'bookings', batchSize: config.batchSize || 100 });

  setUpServices = () => {};
};

const retrieveExtract = (type) => (req, res) => {
  res.status(200).type('json');

  let extractDate = req.params.date.replace(/\.json/i, '');
  let stream = fs.createReadStream(`./.extracts/${type}/${extractDate}.json`);

  stream.on('error', (err) => { log.error(err, 'retrieveExtract ERROR'); });
  stream.on('end', () => { res.end(); });
  stream.on('data', (chunk) => { res.write(chunk); });
};

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/bookings', (req, res) => {
  let extractDetails = services.bookingExtracts.run({
    list: () => services.booking.all(req.query, 10000, 10),
    detail: (row) => services.booking.allDetails(row.id.replace('/bookings/', ''))
  }, (data) => {
    log.info(extractDetails, 'createExtract SUCCESS');

    writeFile(`./.${extractDetails.location}.json`, JSON.stringify(data), 'utf8')
        .then(() => log.info(extractDetails, 'storeExtract SUCCESS'));
  });

  res.status(202).location(extractDetails.location).json(extractDetails);
});
router.get('/bookings/:date', retrieveExtract('bookings'));

module.exports = router;
