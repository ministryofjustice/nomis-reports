module.exports = (agent, name, config, opts) => {
  const getHealthData = (url) => {
    const req = agent.get(url);

    return () => req()
        .then((res) => Object.assign({ name, status: res.status === 200 ? 'UP' : res.status }, res.body))
        .catch((error) => {
          if (opts.logger) {
            opts.logger.error(error, `Error calling ${url}`);
          }

          return { name, status: error.code, error };
        });
  };

  return {
    version: getHealthData(`${config.apiUrl.replace('/api', '')}/version`),
    health: getHealthData(`${config.apiUrl.replace('/api', '')}/health`),
    info: getHealthData(`${config.apiUrl.replace('/api', '')}/info`)
  };
};
