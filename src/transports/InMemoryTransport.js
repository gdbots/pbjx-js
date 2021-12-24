import Transport from './Transport.js';

export default class InMemoryTransport extends Transport {
  /**
   * @param {ServiceLocator} locator
   */
  constructor(locator) {
    super(locator, 'in_memory');
  }
}
