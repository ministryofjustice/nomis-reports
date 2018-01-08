const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const nomisApiAgent = require('../helpers/nomisApiAgent');
const prisonService = require('../repositories/prison');

const getLiveRoll = (req) =>
  req.app.locals.prisonService.liveRoll({ prison_id: req.params.prison_id });

const hyperLinkList = (list) =>
  list.map((nomsId) => `/offenders/${nomsId}`);

const listLiveRoll = (req, res, next) =>
  getLiveRoll(req)
    .then((response) => hyperLinkList(response.body.noms_ids))
    .then((list) => res.json(list))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.nomis;
  let agent = nomisApiAgent(undefined, undefined, config);

  req.app.locals.prisonService = req.app.locals.prisonService || prisonService(agent, config.apiUrl);

  next();
});

router.get('/:prison_id/live_roll', listLiveRoll);

module.exports = router;
