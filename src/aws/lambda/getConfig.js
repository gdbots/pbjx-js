const config = {
  ttl: 60,
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
}
