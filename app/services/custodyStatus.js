module.exports = (agent, root) => ({
  listCustodyStatuses: agent.get(`${root}/custody-status`)
});
