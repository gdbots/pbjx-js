const cache = new Map();

/**
 * Returns all of the event names to use during a lifecycle
 * or publish process for the given pbjx message.
 *
 * @param {Message} message
 * @param {?string} suffix
 * @param {boolean} includeWildcards
 *
 * @returns {string[]}
 */
export default (message, suffix = '', includeWildcards = false) => {
  const schema = message.schema();
  const cacheKey = `${schema.getId()}${suffix}${includeWildcards}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const curie = schema.getCurie();
  const events = schema.getMixins().map(mixin => `${mixin}${suffix}`);
  events.push(`${schema.getCurieMajor()}${suffix}`);
  events.push(`${curie}${suffix}`);

  if (!includeWildcards) {
    cache.set(cacheKey, events);
    return events;
  }

  events.push(`${curie.getVendor()}:${curie.getPackage()}:*`);
  events.push('*');

  cache.set(cacheKey, events);
  return events;
};
