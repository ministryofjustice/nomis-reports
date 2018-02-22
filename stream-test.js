const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);

const BookingService = require('./app/services/BookingService');
const ExtractorAgent = require('./app/helpers/ExtractorAgent');

const log = require('./server/log');
const config = require('./server/config');

const services = {
  booking: new BookingService(config)
};

const bookingExtractor = new ExtractorAgent({ type: 'bookings', concurrency: 10 });

let extractDetails = bookingExtractor.run({
  list: () => services.booking.all({}, 10000, 10),
  detail: (row) => services.booking.allDetails(row.id.replace('/bookings/', '')),
}, (data) => {
  log.info(extractDetails, 'createExtract SUCCESS');

  writeFile(`./.${extractDetails.location}.json`, JSON.stringify(data), 'utf8')
      .then(() => log.info(extractDetails, 'saveExtract SUCCESS'));
});
