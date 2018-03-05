const fs = require('fs');

const BookingService = require('./services/BookingService');
const ExtractorAgent = require('./helpers/ExtractorAgent');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  booking: new BookingService(config)
};

const bookingExtractor = new ExtractorAgent({ type: 'bookings', concurrency: 10 });

let writeStream;
let dataBuffer = [];
let size = 0;

let extractDetails = bookingExtractor.run({
  list: (pageOffset = 0) => services.booking.list({}, pageOffset, 100),
  detail: (row) =>
    services.booking.allDetails(row.id.replace('/bookings/', ''), { basicInfo: true })
      .then((data) => {
        let json = JSON.stringify(data);

        if (!writeStream) {
          dataBuffer.push(json);
        } else {
          if (dataBuffer) {
            dataBuffer.forEach((x) => writeStream.write(x));

            delete dataBuffer;
          }

          writeStream.write(json);
        }

        size += 1;

        return undefined;
      }),
}, () => {
  /*
  let extractpath = `./.${extractDetails.location.substr(1)}.json`;

  let data = results.map((x) => JSON.stringify(x, undefined, '  ')).join(',');

  fs.writeFileSync(extractpath, `[${data}]`, 'utf8');
  */

  writeStream.write(']');

  log.info(Object.assign(extractDetails, { size: size }), 'saveExtract SUCCESS');
});

let extractpath = `./.${extractDetails.location.substr(1)}.json`;

writeStream = fs.createWriteStream(extractpath, 'utf8');
writeStream.write('[');
