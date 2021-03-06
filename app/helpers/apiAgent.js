const defaults = require('superagent-defaults');

const basicAgent = (agent, timeout) =>
  defaults(agent)
    .unset('User-Agent')
    .accept('json')
    .timeout(Object.assign({ response: 2000, deadline: 2500 }, timeout));

const buildUrl = (uri, params) =>
  uri.split('/')
    .map((key) => (key[0] !== ':') ? key : params[key.replace(':', '')] || key)
    .join('/');

const getRouteAgent = (agent = basicAgent(), uri) =>
  (/\/:[^\/]+/gi.test(uri))
    ? (params, query) => agent.get(buildUrl(uri, params)).query(query)
    : (query) => agent.get(uri).query(query);

const postRouteAgent = (agent = basicAgent(), uri) =>
  (body) => agent.post(uri).send(body);

const putRouteAgent = (agent = basicAgent(), uri) =>
  (body) => agent.put(uri).send(body);

const withInterface = (req) => ({
    get(uri) { return getRouteAgent(req, uri); },
    post(uri) { return postRouteAgent(req, uri); },
    put(uri) { return putRouteAgent(req, uri); }
});

module.exports = (agent, plugins = [], opts) => {
  agent = basicAgent(agent, opts && opts.timeout);
  return withInterface(plugins.reduce((a, p) => (a.use(p)) && a, agent));
};
