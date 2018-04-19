const log = require('../../server/log');

function RequestQueue(onData, config) {
  this._queue = [];
  this._results = [];
  this._onData = onData;

  this._concurrency = config.concurrency || 1;

  this._workers = 0;
  this._queued = 0;
  this._completed = 0;
}

RequestQueue.prototype.push = function(items) {
  Array.prototype.push.apply(this._queue, Array.isArray(items) ? items : [items]);
  this._queued = this._queue.length;

  this.next();

  return this;
};

function _processNext(rq) {
  let cb = () => {
    rq._workers -= 1;
    rq._completed +=1;
    rq.next();

    cb = () => {};
  };

  let row = Array.prototype.shift.apply(rq._queue);
  rq._queued = rq._queue.length;

  if (!row) {
    return this;
  }

  log.debug('RequestQueue PROCESSING JOB');
  rq._workers += 1;

  try {
    rq._onData(row, cb);
  } catch(err) {
    rq._workers -= 1;
    rq.push(row);
    rq.next();
  }
};

RequestQueue.prototype.next = function() {
  while (this._queued > 0 && this._workers < this._concurrency) {
    _processNext(this);
  }

  return this;
};

RequestQueue.prototype.queued = function() {
  return this._queued || 0;
};

RequestQueue.prototype.completed = function() {
  return this._completed || 0;
};

RequestQueue.prototype.activeWorkers = function() {
  return this._workers || 0;
};

RequestQueue.prototype.report = function() {
  return {
    total: this.completed() + this.queued(),
    done: this.completed(),
    remaining: this.queued(),
    activeWorkers: this.activeWorkers(),
  };
};

module.exports = RequestQueue;
