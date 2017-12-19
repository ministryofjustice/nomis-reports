module.exports = (agent, root) => ({
  postLogin: agent.post(`${root}/users/login`)
});
