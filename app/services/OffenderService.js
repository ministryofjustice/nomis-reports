const OffenderRepository = require('../repositories/OffenderRepository');
const CachingRepository = require('../helpers/CachingRepository');
const RetryingRepository = require('../helpers/RetryingRepository');

function OffenderService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(new RetryingRepository(new OffenderRepository(config)));
}

OffenderService.prototype.getDetails = function (nomsId) {
  return this.repository.getDetails(nomsId);
};

OffenderService.prototype.getLocation = function (nomsId) {
  return this.repository.getLocation(nomsId);
};

OffenderService.prototype.getImage = function (nomsId) {
  return this.repository.getImage(nomsId);
};

OffenderService.prototype.getCharges = function (nomsId) {
  return this.repository.getCharges(nomsId);
};

OffenderService.prototype.getPssDetail = function (nomsId) {
  return this.repository.getPssDetail(nomsId);
};

module.exports = OffenderService;
