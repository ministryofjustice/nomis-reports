const LocationRepository = require('../repositories/LocationRepository');

function LocationService(config, repo) {
  this.config = config;
  this.repository = repo || new LocationRepository(config);
}

LocationService.prototype.list = function (query) {
  return this.repository.list(query);
};

LocationService.prototype.getDetails = function (locationId) {
  return this.repository.getDetails(locationId);
};

LocationService.prototype.listInmates = function (locationId, query) {
  return this.repository.listInmates(locationId, query);
};

module.exports = LocationService;
