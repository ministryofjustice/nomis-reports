module.exports = (agent, root) => ({
  list: agent.get(`${root}/agencies`),
  getDetails: agent.get(`${root}/agencies/:agency_id`),
});
