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
export default function getEventNames(message, suffix = '', includeWildcards = false) {
  const schema = message.schema();
  const cacheKey = `${schema.getId()}${suffix}${includeWildcards}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const curie = schema.getCurie();
  const events = [];

  schema.getMixinIds().forEach(mixinId => events.push(`${mixinId}${suffix}`));
  schema.getMixinCuries().forEach(mixinCurie => events.push(`${mixinCurie}${suffix}`));
  events.push(`${schema.getCurieMajor()}${suffix}`);
  events.push(`${curie}${suffix}`);

  if (!includeWildcards) {
    cache.set(cacheKey, events);
    return events;
  }

  const vendor = curie.getVendor();
  const pkg = curie.getPackage();
  const category = curie.getCategory();

  events.push(`${vendor}:${pkg}:${category}:*`);
  events.push(`${vendor}:${pkg}:*`);
  events.push(`${vendor}:*`);
  events.push('*');

  cache.set(cacheKey, events);
  return events;
}
