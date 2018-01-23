
module.exports.user = (id) => `/users/${id}`;
module.exports.prison = (id) => `/prisons/${id}`;
module.exports.prisonLiveRoll = (id) => `/prisons/${id}/live_roll`;
module.exports.agency = (id) => `/agencies/${id}`;
module.exports.agencyContactDetails = (id) => `/agencies/${id}/contactDetails`;
module.exports.agencyLocations = (id) => `/agencies/${id}/locations`;
module.exports.location = (id) => `/locations/${id}`;
module.exports.locationInmates = (id) => `/locations/${id}/inmates`;
module.exports.booking = (id) => `/bookings/${id}`;
module.exports.sentenceDetail = (id) => `/bookings/${id}/sentenceDetail`;
module.exports.mainOffence = (id) => `/bookings/${id}/mainOffence`;
module.exports.aliases = (id) => `/bookings/${id}/aliases`;
module.exports.contacts = (id) => `/bookings/${id}/contacts`;
module.exports.adjudications = (id) => `/bookings/${id}/adjudications`;
module.exports.iepSummary = (id) => `/bookings/${id}/iepSummary`;
module.exports.offender = (id) => `/offenders/${id}`;
module.exports.custodyStatus = (id) => `/custodyStatuses/${id}`;
