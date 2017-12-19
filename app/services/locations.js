module.exports = (agent, root) => ({
  list: agent.get(`${root}/locations`),
  getDetails: agent.get(`${root}/locations/:location_id`),
  listImates: agent.get(`${root}/locations/:location_id/inmates`),
});
