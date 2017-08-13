export default class Transport {
  /**
   * @param {ServiceLocator} locator
   * @param {string} transportName
   */
  constructor(locator, transportName) {
    Object.defineProperty(this, 'locator', { value: locator });
    Object.defineProperty(this, 'transportName', { value: transportName });
  }
}
