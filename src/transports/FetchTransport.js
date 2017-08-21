/* eslint-disable class-methods-use-this */
import EnvelopeV1 from '@gdbots/schemas/gdbots/pbjx/EnvelopeV1';
import Message from '@gdbots/pbj/Message';
import { ACCESS_TOKEN_ENV_KEY, ACCESS_TOKEN_STORAGE_KEY, TRANSPORT_HTTP_ENVELOPE_RECEIVED, } from '../constants';
import EnvelopeReceivedEvent from '../events/EnvelopeReceivedEvent';
import Transport from './Transport';
import LogicException from '../exceptions/LogicException';

export default class FetchTransport extends Transport {
  /**
   * @param {ServiceLocator} locator
   * @param {string} endpoint
   */
  constructor(locator, endpoint) {
    super(locator, 'fetch');
    Object.defineProperty(this, 'endpoint', { value: endpoint });
  }

  /**
   * {@inheritDoc}
   */
  async doSendRequest(request) {
    const envelope = await this.doFetchRequest(request);
    if (envelope.get('ok')) {
      return envelope.get('message');
    }

    throw new LogicException(envelope.get('error_message'));
  }

  /**
   * @param {Message} message - the message (command, event, request) initiating the fetch operation.
   * @param {Object}  options - the options that will be passed "fetch(url, options)"
   *
   * @returns {Object} The final options object to use for the fetch.
   */
  filterFetchOptions(message, options) {
    return options;
  }

  /**
   * Returns a bearer token to be used in the fetch operation.
   *
   * @returns {?string}
   */
  getAccessToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    }

    if (typeof process !== 'undefined' && process.env) {
      return process.env[ACCESS_TOKEN_ENV_KEY] || null;
    }

    return null;
  }

  /**
   * @private
   *
   * @param {Message} message
   *
   * @returns {Promise.<Message>} Resolves with the envelope returned from the HTTP operation.
   */
  async doFetchRequest(message) {
    const fetchRequest = this.createFetchRequest(message);

    try {
      const response = await fetch(fetchRequest);
      const envelope = EnvelopeV1.fromObject(await response.json());
      const event = new EnvelopeReceivedEvent(message, envelope);
      console.log('envelope', envelope.toString());
      this.locator.getDispatcher().dispatch(TRANSPORT_HTTP_ENVELOPE_RECEIVED, event);
      return envelope;
    } catch (error) {
      return EnvelopeV1.create()
        .set('ok', false)
        .set('error_name', error.name)
        .set('error_message', error.message);
    }
  }

  /**
   * @private
   *
   * @param {Message} message
   *
   * @returns {Request}
   */
  createFetchRequest(message) {
    const curieAsUri = message.schema().getCurie()
      .toString()
      .replace('::', ':_:')
      .replace(/:/g, '/');

    const url = `${this.endpoint}/${curieAsUri}`;
    const options = {
      method: 'POST',
      body: `${message}`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      mode: 'cors',
    };

    const accessToken = this.getAccessToken();
    if (accessToken) {
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      options.credentials = 'include';
    }

    return new Request(url, this.filterFetchOptions(message, options));
  }
}
