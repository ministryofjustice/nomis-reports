module.exports = (agent, root) => ({
  getDetails: agent.get(`${root}/offenders/:noms_id`),
  getLocation: agent.get(`${root}/offenders/:noms_id/location`),
  getImage: agent.get(`${root}/offenders/:noms_id/image`),
  getCharges: agent.get(`${root}/offenders/:noms_id/charges`),
  getPssDetail: agent.get(`${root}/offenders/:noms_id/pss_detail`),
});
