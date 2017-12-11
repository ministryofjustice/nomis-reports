
// helper methods

const objToList = (obj) => {
  var list = [];

  for (var id in obj) {
    list.push(Object.assign({}, obj[id]));
  }

  return list;
};

const objToFilteredList = (match) => (obj) => {
  var list = [];

  for (var id in obj) {
    if (match(obj[id])) list.push(Object.assign({}, obj[id]));
  }

  return list;
};

const pick = (obj, p) => {
  for (var id in obj) {
    if (id === p) return obj[p];
  }

  return;
};

const inspect = (x) => {
  console.log(x);
  return x;
};

const raw = (res, model) => () => res.json(model);
const rendered = (res, view, model) => () => res.render(view, model);
const format = (res, view) => (model) => res.format({
  html: rendered(res, view, model),
  json: raw(res, model),
});

const redirect = (res, route) => () => res.redirect(route);

const failWithError = (res, next) => (err) => {
  var ex = new Error(typeof err === 'string' ? err : err.message);
  if (err.stack) {
    ex.stack = err.stack;
  }

  res.status(400) && next(ex);
};

const rpcError = (url, opts, err) => {
  err.url = url;
  err.options = opts;

  console.error('RPC Error Occured:');
  console.error(err);

  return err;
};

const errorCheck = (resolve, reject) => (err, data) =>
  err ? reject(err) : resolve(data);

const rpcErrorCheck = (url, opts, resolve, reject) => (err, data) =>
  err ? reject(rpcError(url, opts, err)) : resolve(data);

module.exports = {
  objToList: objToList,
  objToFilteredList: objToFilteredList,
  pick: pick,
  inspect: inspect,
  raw: raw,
  rendered: rendered,
  format: format,
  redirect: redirect,
  failWithError: failWithError,
  rpcError: rpcError,
  errorCheck: errorCheck,
  rpcErrorCheck: rpcErrorCheck,
};
