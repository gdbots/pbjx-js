/**
 * Converts a curie to an id that should exist in
 * a service locator (IoC) that can handle the
 * given curie.
 *
 * @param {SchemaCurie} curie
 *
 * @returns {string}
 */
export default function curieToHandlerServiceId(curie) {
  const pkg = curie.getPackage().replace(/\./g, '-');
  const msg = curie.getMessage().replace(/-/g, '_');
  return `@${curie.getVendor()}/${pkg}/${msg}_handler`;
}
