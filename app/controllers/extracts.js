const express = require('express');
const router = new express.Router();

const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);

const BookingService = require('../services/BookingService');
const OffenderService = require('../services/OffenderService');
const CustodyStatusService = require('../services/CustodyStatusService');

const formatDate = (d) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}T${d.getHours()}:${d.getMinutes()}`;

const RequestQueue = require('../helpers/RequestQueue');

const services = {};
let setUpServices = (config) => {
  services.booking = services.booking || new BookingService(config);
  services.offenders = services.offenders || new OffenderService(config);
  services.custodyStatuses = services.custodyStatuses || new CustodyStatusService(config);

  setUpServices = () => {};
};

const createDetailRequest = (req, opts, ids, results) => {
  let x = ids.next();

  if (x) {
    return opts.detail(req, x)
      .then((data) => {
        results.push(data);

        return createDetailRequest(req, opts, ids, results);
      });
  }
};

const populateList = (req, opts, ids) => {
  let batch = [];
  let results = [];

  for (let i = 0; i < opts.batchSize; i++) {
    batch.push(createDetailRequest(req, opts, ids, results));
  }

  return Promise.all(batch)
    .then(() => results);
};

const createExtract = (opts) => (req, res) => {
  let extractDate = formatDate(new Date());
  let location = `/extracts/${opts.type}/${extractDate}`;
  let filepath = `./.extracts/${opts.type}/${extractDate}.json`;

  opts.list(req)
    .then((ids) => new RequestQueue().push(ids))
    .then((queue) => populateList(req, opts, queue))
    .then((data) => writeFile(filepath, JSON.stringify(data), 'utf8'))
    .catch((err) => { console.log(err); });

  res.status(202).location(location).json({ extractDate, location });
};

const retrieveExtract = (type) => (req, res) => {
  res.status(200).type('json');

  let extractDate = req.params.date.replace(/\.json/i, '');
  let stream = fs.createReadStream(`./.extracts/${type}/${extractDate}.json`);

  stream.on('error', (err) => { req.log.info(err); });
  stream.on('end', () => { res.end(); });
  stream.on('data', (chunk) => { res.write(chunk); });
};

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/bookings', createExtract({
  type: 'bookings',
  batchSize: 5,
  list: (req) => services.booking.all(req.query),
  detail: (req, x) => services.booking.allDetails(x.replace('/bookings/', '')),
}));
router.get('/bookings/:date', retrieveExtract('bookings'));

router.get('/custodyStatuses', createExtract({
  type: 'custodyStatuses',
  batchSize: 5,
  list: (req, pageOffset) => services.custodyStatuses.list(req.query, pageOffset),
  detail: (req, x) => services.offenders.allDetails(x.offenderNo),
}));
router.get('/custodyStatuses/:date', retrieveExtract('custodyStatuses'));

module.exports = router;
