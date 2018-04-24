const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const ReportsService = require('../services/ReportsService');
const BookingService = require('../services/BookingService');
const AOModel = require('../models/AO');
const CDEModel = require('../models/CDE');

const services = {};
let setUpServices = (config) => {
  services.reports = services.reports || new ReportsService(config);
  services.booking = services.booking || new BookingService(config);

  setUpServices = () => {};
};

const listAlerts = (data) =>
  services.booking.listAlerts(data.bookings[0].offenderBookingId)
    .catch(err => {
      if (err.status === 404) {
        return Promise.resolve([]);
      }
    })
    .then(alerts => data.alerts = alerts)
    .then(() => data);

const list = (req, res, next) =>
  services.reports.listOffenders(req.params.offenderId)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveDetails = (req, res, next) =>
  services.reports.getDetails(req.params.offenderId)
    .then(listAlerts)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveAODetails = (req, res, next) =>
  services.reports.getDetails(req.params.offenderId)
    .then(listAlerts)
    .then(AOModel.build)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveCDEDetails = (req, res, next) =>
  services.reports.getDetails(req.params.offenderId)
    .then(listAlerts)
    .then(CDEModel.build)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', list);
router.get('/:offenderId/', retrieveDetails);
router.get('/:offenderId/ao', retrieveAODetails);
router.get('/:offenderId/cde', retrieveCDEDetails);

module.exports = router;
