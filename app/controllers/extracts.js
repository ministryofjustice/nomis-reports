const express = require('express');
const router = new express.Router();

const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

const helpers = require('../helpers');
const links = require('../helpers/links');
const BookingService = require('../services/BookingService');

function RequestQueue() {
  this._queue = [];
  this._results = [];
}

RequestQueue.prototype.push = function(items) {
  Array.prototype.push.apply(this._queue, items);

  this._length = this._queue.length;

  return this;
};

RequestQueue.prototype.next = function() {
  let item = Array.prototype.shift.apply(this._queue);

  this._length = this._queue.length;

  return item;
};

RequestQueue.prototype.length = function() {
  return this._length;
};


const map = (fn) => (x) =>
  x && (Array.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => {
  if (x[p]) {
    (x.links = x.links || {})[k] = fn(x[p]);
  }

  return x;
};

const addBookingLinks = (p) => expandLink(p, 'booking', links.booking);
const addSentenceDetailLinks = (p) => expandLink(p, 'sentenceDetail', links.sentenceDetail);
const addMainOffenceLinks = (p) => expandLink(p, 'mainOffence', links.mainOffence);
const addAliasesLinks = (p) => expandLink(p, 'aliases', links.aliases);
const addContactsLinks = (p) => expandLink(p, 'contacts', links.contacts);
const addAdjudicationsLinks = (p) => expandLink(p, 'adjudications', links.adjudications);
const addIepSummaryLinks = (p) => expandLink(p, 'iepSummary', links.iepSummary);
const addOffenderLinks = (p) => expandLink(p, 'offender', links.offender);
const addCustodyStatusLinks = (p) => expandLink(p, 'custodyStatus', links.custodyStatus);
const addAssignedLivingUnitLinks = (p) => expandLink(p, 'assignedLivingUnit', links.location);

const services = {};
const setUpServices = (config) => {
  services.booking = services.booking || new BookingService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map((data) => {
      if (data.assignedLivingUnit && data.assignedLivingUnit.locationId) {
        data.assignedLivingUnit = data.assignedLivingUnit.locationId;
      }
      return data;
    }))
    .then(map(addBookingLinks('bookingId')))
    .then(map(addSentenceDetailLinks('bookingId')))
    .then(map(addMainOffenceLinks('bookingId')))
    .then(map(addAliasesLinks('bookingId')))
    .then(map(addContactsLinks('bookingId')))
    .then(map(addAdjudicationsLinks('bookingId')))
    .then(map(addIepSummaryLinks('bookingId')))
    .then(map(addOffenderLinks('offenderNo')))
    .then(map(addCustodyStatusLinks('offenderNo')))
    .then(map(addAssignedLivingUnitLinks('assignedLivingUnit')));

const createDetailRequest = (service, fn, ids, results) => {
  let id = ids.next();

  if (id) {
    console.log('CREATE DETAIL REQUEST', id);

    return proxy(service, fn, id)
      .then((data) => { console.log(id, 'SUCCESS'); return results.push(data); })
      .catch(() => { console.log(id, 'FAIL'); })
      .then(() => {
        return createDetailRequest(service, 'getDetails', ids, results);
      });
  }
};

const populateList = (service, fn, ids, batchSize) => {
  console.log('POPULATE LIST');

  let batch = [];
  let results = [];

  for (let i = 0; i < batchSize; i++) {
    batch.push(createDetailRequest(service, 'getDetails', ids, results));
  }

  return Promise.all(batch)
    .then(() => {
      console.log('POPULATE LIST COMPLETE');

      return results;
    });
};

const buildList = (service, fn, query, batchSize, pageOffset = 0, ids = new RequestQueue(), results) => {
  console.log('BUILD LIST', pageOffset);

  return service[fn](query, pageOffset)
    .then((items = []) => {
      ids.push(items.map((x) => x.bookingId));

      if (items.length > 0) {
        return buildList(service, fn, query, batchSize, ++pageOffset, ids, results);
      }

      if (!results) {
        results = populateList(service, 'getDetails', ids, batchSize);
      }

      return results;
    });
};

const process = (service, fn, query, batchSize) => {
  let extractDate = (new Date()).toISOString();
  let location = `bookings/${extractDate}`;

  buildList(service, fn, query, batchSize)
    .then((data) => {
      console.log('WRITING FILE');

      return writeFile(`./.extracts/${location}.json`, JSON.stringify(data), 'utf8');
    });

  return Promise.resolve({ extractDate, location });
};

const createExtract = (req, res, next) =>
  process(services.booking, 'list', req.query.query, 5)
    .then((meta) => {
      res.status(202).location('/' + meta.location).json(meta);
    })
    .catch(helpers.failWithError(res, next));

const retrieveExtract = (req, res) => {
  res.status(200).type('json');

  let stream = fs.createReadStream(`./.extracts/bookings/${req.params.date.replace(/\.json/i, '')}.json`);

  stream.on('error', (err) => { req.log.info(err, 'ARGH'); });
  stream.on('end', () => { res.end(); });
  stream.on('data', (chunk) => { res.write(chunk); });
};

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', createExtract);
router.get('/:date', retrieveExtract);

module.exports = router;
