const aws = require('aws-sdk');

const ssm = new aws.SSM({
  apiVersion: '2014-11-06',
});

const config = {
  loaded: false,
};

const callSsm = (params) => {
  return new Promise((resolve, reject) => {
    ssm.getParameters(params, (err, data) => {
      if (err) {
        return reject(err.message);
      }

      return resolve(data.Parameters.reduce((acc, param) => {
        acc[param.Name] = param.Value;

        return acc;
      }, {}));
    });
  });
};

/**
 * Gets the config from the SSM service.
 *
 * @param {Object} params - Keys are the SSM parameter names, values are the variables to map to.
 * @param {number} ttl    - Number of seconds to wait before refreshing the config.
 *
 * @returns {Object} Returns the configuration from SSM.
 */
export default async function getConfig(params, ttl = 60) {
  if (config.loaded && config.expires_at > new Date()) {
    return config;
  }

  const names = Object.keys(params).map(key => (params[key]));
  try {
    const result = await callSsm({
      Names: names,
      WithDecryption: true,
    });

    config.loaded = true;
    config.expires_at = new Date() + ttl;

    Object.assign(config, result);
  } catch (e) {
    config.loaded = false;
    throw e;
  }

  return config;
}
