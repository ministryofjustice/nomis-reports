module.exports = (agent, root) => ({
  login: agent.post(`${root}/users/login`)
});
