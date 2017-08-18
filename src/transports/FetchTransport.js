import Transport from './Transport';

export default class FetchTransport extends Transport {
  /**
   * @param {ServiceLocator} locator
   */
  constructor(locator) {
    super(locator, 'fetch');
  }
}
