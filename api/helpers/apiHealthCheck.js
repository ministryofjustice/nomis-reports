const apiHealthCheck = (request, tokenGen = () => {}, config = {}, url, name, description) =>
  (log) =>
    new Promise(resolve => {
      let timeout = config.timeout || { response: 10000, deadline: 10500 };

      let req = request
        .get(url)
        .unset('User-Agent')
        .accept('application/json')
        .timeout({
          response: timeout.response,
          deadline: timeout.deadline,
        });

      if (config.apiGatewayToken && config.apiGatewayPrivateKey) {
        try {
          let gwToken = tokenGen(config.apiGatewayToken, config.apiGatewayPrivateKey);

          if (gwToken) {
            req.set('Authorization', `Bearer ${gwToken}`);
          }
        } catch (error) {
          log.error(error, `Error generating ${description} Gateway Token`);
        }
      }

      req.end((error, res) => {
          if (error) {
            log.error(error, `Error calling ${description}`);
            return resolve(Object.assign({ name }, { status: error.code }, error));
          }

          resolve(Object.assign({ name }, { status: res.status === 200 ? 'OK' : res.status }, res.body));
        });
    });

module.exports = apiHealthCheck;
