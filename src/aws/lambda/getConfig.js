// prefixig "pbjx" on config to avoid collision with
// parameter names a consumer might want to fetch
const config = { pbjxLoaded: false };

const callSsm = (ssm, paramMap) => (
  new Promise((resolve, reject) => {
    const params = {
      Names: Object.keys(paramMap),
      WithDecryption: true,
    };

    ssm.getParameters(params, (err, data) => {
      if (err) {
        return reject(err.message);
      }

      // initialize all expected params with null
      const result = Object.values(paramMap).reduce((acc, param) => {
        acc[param] = null;
        return acc;
      }, {});

      result.pbjxInvalidParams = data.InvalidParameters || [];

      if (!data.Parameters) {
        return resolve(result);
      }

      return resolve(data.Parameters.reduce((acc, param) => {
        acc[paramMap[param.Name]] = param.Type && param.Type === 'StringList' ? param.Value.split(',') : param.Value;
        return acc;
      }, result));
    });
  })
);

/**
 * Gets the config from the SSM service.
 *
 * @param {SSM|Object} ssm  - An AWS.SSM client instance or object mocking its functionality.
 * @param {Object} paramMap - Keys are the SSM parameter names, values are the variables to map to.
 * @param {number} ttl      - Number of seconds to wait before refreshing the config.
 *
 * @returns {Object}
 */
export default async (ssm, paramMap, ttl = 60) => {
  if (config.pbjxLoaded && config.pbjxExpiresAt > new Date()) {
    return config;
  }

  try {
    const result = await callSsm(ssm, paramMap);

    const date = new Date();
    date.setSeconds(date.getSeconds() + ttl);

    config.pbjxLoaded = true;
    config.pbjxExpiresAt = date;

    Object.assign(config, result);
  } catch (e) {
    if (!config.pbjxLoaded) {
      throw e;
    }
  }

  return config;
};
