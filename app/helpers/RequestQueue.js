const log = require('../../server/log');

function RequestQueue(config) {
  this._queue = [];
  this._results = [];
  this._onComplete = () => {};
  this._onData = () => {};

  this._concurrency = config.concurrency || 1;

  this._workers = 0;
  this._length = 0;
  this._size = 0;
  this._started;
  this._finished;
  this._finalized = false;
}

RequestQueue.prototype.push = function(items) {
  log.debug('RequestQueue PUSH');

  Array.prototype.push.apply(this._queue, Array.isArray(items) ? items : [items]);
  this._length = this._queue.length;

  if (!this._started) {
    this._started = new Date();
  }

  return this.heartbeat();
};

RequestQueue.prototype.add = function(items) {
  log.debug('RequestQueue ADD');

  Array.prototype.push.apply(this._results, Array.isArray(items) ? items : [items]);
  this._size = this._results.length;

  return this;
};

RequestQueue.prototype.next = function() {
  if (this._length === 0 && this._finalized) {
    return this.finish();
  }

  this._workers += 1;
  let row = Array.prototype.shift.apply(this._queue);
  if (!row) {
    log.debug('RequestQueue EMPTY');
    return this;
  }

  this._length = this._queue.length;

  log.debug('RequestQueue NEXT');
  this._onData(row)
    .then((data) => this.add(data))
    .catch(() => { this.push(row); return Promise.resolve(); })
    .then(() => this._workers -= 1);

  return this;
};

RequestQueue.prototype.heartbeat = function() {
  if (this._finished) {
    log.debug('RequestQueue FINISHED');
    return this;
  }

  process.nextTick(() => {
    while (this._workers < this._concurrency) {
      log.debug({
        workers: this._workers,
        concurrency: this._concurrency,
        saturated: this._workers <= this._concurrency
      }, 'RequestQueue HEARTBEAT');

      this.next();
    }

    setTimeout(() => this.heartbeat(), 100);
  });

  return this;
};

RequestQueue.prototype.finish = function() {
  log.debug('RequestQueue FINISH');

  this._finished = new Date();
  this._onComplete(this._results);

  return this;
};

RequestQueue.prototype.length = function() {
  return this._length;
};

RequestQueue.prototype.size = function() {
  return this._size;
};

RequestQueue.prototype.running = function() {
  return this._workers;
};

RequestQueue.prototype.started = function() {
  return this._started;
};

RequestQueue.prototype.runtime = function() {
  return (new Date() - this.started()) / 1000;
};

RequestQueue.prototype.finished = function() {
  return this._finished;
};

RequestQueue.prototype.estimation = function() {
  return (this.size() / this.length()) * 100;
};

RequestQueue.prototype.report = function() {
  return {
    total: this.size() + this.length(),
    done: this.size(),
    remaining: this.length(),
    percentComplete: this.estimation().toFixed(2) + '%',
    running: this.running(),
    runtime: this.runtime().toFixed(2) + ' sec',
  };
};

RequestQueue.prototype.finalize = function() {
  this._finalized = true;

  return this;
};

RequestQueue.prototype.onComplete = function(fn) {
  this._onComplete = fn;

  return this;
};

RequestQueue.prototype.onData = function(fn) {
  this._onData = fn;

  return this;
};

module.exports = RequestQueue;
