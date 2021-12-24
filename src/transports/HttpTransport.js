import Exception from '@gdbots/pbj/Exception.js';
import Code from '@gdbots/schemas/gdbots/pbjx/enums/Code.js';
import EnvelopeV1 from '@gdbots/schemas/gdbots/pbjx/EnvelopeV1.js';
import HttpCode from '@gdbots/schemas/gdbots/pbjx/enums/HttpCode.js';
import ObjectSerializer from '@gdbots/pbj/serializers/ObjectSerializer.js';
import { ACCESS_TOKEN_ENV_KEY, ACCESS_TOKEN_STORAGE_KEY, TRANSPORT_HTTP_ENVELOPE_RECEIVED } from '../constants.js';
import EnvelopeReceivedEvent from '../events/EnvelopeReceivedEvent.js';
import HttpTransportFailed from '../exceptions/HttpTransportFailed.js';
import Transport from './Transport.js';
import PbjxToken from '../PbjxToken.js';
import { vendorToHttp } from '../utils/statusCodeConverter.js';

export default class HttpTransport extends Transport {
  /**
   * @param {ServiceLocator} locator
   * @param {string} endpoint
   */
  constructor(locator, endpoint) {
    super(locator, 'http');
    Object.defineProperty(this, 'endpoint', { value: endpoint });
  }

  async doSendCommand(command) {
    const envelope = await this.callEndpoint(command);
    if (envelope.get('ok')) {
      // do we need to resolve with the message_ref generated?
      // from the server (ids from browser client are not used for security)
      return;
    }

    throw new HttpTransportFailed(command, envelope);
  }

  async doSendEvent(event) {
    const envelope = await this.callEndpoint(event);
    if (envelope.get('ok')) {
      // do we need to resolve with the message_ref generated?
      // from the server (ids from browser client are not used for security)
      return;
    }

    throw new HttpTransportFailed(event, envelope);
  }

  async doSendRequest(request) {
    const envelope = await this.callEndpoint(request);
    if (envelope.get('ok')) {
      return envelope.get('message');
    }

    throw new HttpTransportFailed(request, envelope);
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
   * @param {Message} message - the (command, event, request) initiating the fetch operation.
   * @param {Object}  options - the options that will be passed "fetch(url, options)"
   *
   * @returns {Object} The final options object to use for the fetch.
   */
  filterFetchOptions(message, options) {
    return options;
  }

  /**
   * @private
   *
   * @param {Message} message
   *
   * @returns {Promise.<Message>} Resolves with the envelope returned from the HTTP operation.
   */
  async callEndpoint(message) {
    const fetchRequest = this.createFetchRequest(message);

    try {
      const response = await fetch(fetchRequest);
      const envelope = await ObjectSerializer.deserialize(await response.json());
      const event = new EnvelopeReceivedEvent(message, envelope, response);
      const dispatcher = await this.locator.getDispatcher();
      await dispatcher.dispatch(TRANSPORT_HTTP_ENVELOPE_RECEIVED, event);
      return envelope;
    } catch (e) {
      let code = Code.UNAVAILABLE.getValue();
      if (e instanceof Exception) {
        code = e.getCode() || code;
      }

      return EnvelopeV1.create()
        .set('ok', false)
        .set('code', code)
        .set('message_ref', message.generateMessageRef())
        .set('message', message)
        .set('http_code', HttpCode.create(vendorToHttp(code)))
        .set('error_name', e.name)
        .set('error_message', e.message.substr(0, 2048));
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
      options.headers.Authorization = `Bearer ${accessToken}`;
      options.headers['x-pbjx-token'] = PbjxToken.create(options.body, url, 'bearer', accessToken).toString();
      options.credentials = 'include';
    }

    return new Request(url, this.filterFetchOptions(message, options));
  }
}
