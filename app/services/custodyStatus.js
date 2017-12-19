module.exports = (agent, root) => ({
  list: agent.get(`${root}/custody-statuses`),
  getCustodyStatus: agent.get(`${root}/custody-statuses/:noms_id`),
});
