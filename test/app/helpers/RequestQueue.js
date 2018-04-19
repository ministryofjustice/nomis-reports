//let should = require('chai').should();

const RequestQueue = require('../../../app/helpers/RequestQueue');

describe('RequestQueue', () => {
  it('should process sync jobs as they are added', () => {
    let processed = [];

    let q = new RequestQueue((job, done) => {
      processed.push(job);
      done(job);
    }, { concurrency: 1 });

    q.push('A');
    q.queued().should.equal(0);
    processed.length.should.equal(1);
    q.push('B');
    q.queued().should.equal(0);
    processed.length.should.equal(2);
    q.push('C');
    q.queued().should.equal(0);
    processed.length.should.equal(3);
  });

  it('should process all sync jobs as they are added', () => {
    let processed = [];

    let q = new RequestQueue((job, done) => {
      processed.push(job);
      done(job);
    }, { concurrency: 1 });

    q.push([ 'A', 'B', 'C' ]);
    q.queued().should.equal(0);
    processed.length.should.equal(3);
  });

  it('should process async jobs when workers are available', () => {
    let processed = [];

    let q = new RequestQueue((job, done) => {
      setTimeout(() => {
        processed.push(job);
        done(job);
      }, 10);
    }, { concurrency: 1 });

    q.push([ 'A', 'B', 'C' ]);
    q.queued().should.equal(2);
    processed.length.should.equal(0);

    setTimeout(() => {
      q.queued().should.equal(0);
      processed.length.should.equal(3);
    }, 0);
  });

});
