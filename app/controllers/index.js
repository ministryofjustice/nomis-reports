const express = require('express');
const router = express.Router();
const helpers = require('../helpers');

// private

const renderIndex = (res) => helpers.format(res, 'index');

const createIndexViewModel = (/* req */) => (/*data*/) => ({});

const displayIndex = (req, res, next) =>
  (new Promise((res /*, rej*/) => { res({}); }))
    .then(createIndexViewModel(req))
    .then(renderIndex(res))
    .catch(helpers.failWithError(res, next));

// public

router.get('/', displayIndex);

// exports

module.exports = router;
