
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
const format = (res, view, transform) => (model) => res.format({
  html: rendered(res, view, transform ? transform(model) : model),
  json: raw(res, model),
});

const redirect = (res, route) => () => res.redirect(route);

const failWithError = (res, next) => (err) => {
  let ex = new Error(typeof err === 'string' ? err : err.message);
  if (err.stack) {
    ex.stack = err.stack;
  }

  res.status(400) && next(ex);
};

const rpcError = (url, opts, next) => (err) => {
  err.url = url;
  err.options = opts;

  console.error('RPC Error Occured:');
  console.error(err);

  next(err);
};

const errorCheck = (resolve, reject) => (err, data) =>
  err ? reject(err) : resolve(data);

const rpcErrorCheck = (url, opts, resolve, reject) => (err, data) =>
  err ? reject(rpcError(url, opts, err)) : resolve(data);

const handleResponse = (fallback) => (res) => {
  if (res.status >= 200 && res.status <= 299) {
    return res.body;
  }

  console.log((res.response && res.response.error) || res);
  return fallback;
};

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
  handleResponse: handleResponse,
};
