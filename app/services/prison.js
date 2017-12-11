module.exports = (agent, root) => ({
  liveRoll: agent.get(`${root}/prison/:prison_id/live_roll`)
});
