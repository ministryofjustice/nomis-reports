
function RequestQueue() {
  this._queue = [];

  this._length = 0;
}

RequestQueue.prototype.push = function(items) {
  Array.prototype.push.apply(this._queue, items);

  this._length = this._queue.length;

  return this;
};

RequestQueue.prototype.next = function() {
  let item = Array.prototype.shift.apply(this._queue);

  this._length = this._queue.length;

  return item;
};

RequestQueue.prototype.length = function() {
  return this._length;
};

module.exports = RequestQueue;
