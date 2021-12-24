import clamp from 'lodash-es/clamp.js';
import trim from 'lodash-es/trim.js';
import {
  EVENT_PREFIX,
  SUFFIX_AFTER_HANDLE,
  SUFFIX_BEFORE_HANDLE,
  SUFFIX_BIND,
  SUFFIX_CREATED,
  SUFFIX_ENRICH,
  SUFFIX_VALIDATE,
} from './constants.js';
import getEventNames from './utils/getEventNames.js';
import BusExceptionEvent from './events/BusExceptionEvent.js';
import GetResponseEvent from './events/GetResponseEvent.js';
import InvalidArgumentException from './exceptions/InvalidArgumentException.js';
import PbjxEvent from './events/PbjxEvent.js';
import RequestHandlingFailed from './exceptions/RequestHandlingFailed.js';
import TooMuchRecursion from './exceptions/TooMuchRecursion.js';
import ResponseCreatedEvent from './events/ResponseCreatedEvent.js';

const locatorSym = Symbol('locator');
const maxRecursionSym = Symbol('maxRecursion');

/**
 * @param {Message} message
 * @param {Schema}  schema
 *
 * @returns {Message[]}
 */
const getNestedMessages = (message, schema) => {
  const messages = [];

  schema.getFields().forEach((field) => {
    if (!field.getType().isMessage()) {
      return;
    }

    if (!message.has(field.getName())) {
      return;
    }

    if (field.isASingleValue()) {
      messages.push(message.get(field.getName()));
      return;
    }

    if (field.isAList()) {
      message.get(field.getName()).forEach(v => messages.push(v));
      return;
    }

    const obj = message.get(field.getName());
    Object.keys(obj).forEach(k => messages.push(message.get(obj[k])));
  });

  return messages;
};

export default class Pbjx {
  /**
   * @param {ServiceLocator} locator
   * @param {number} maxRecursion
   */
  constructor(locator, maxRecursion = 10) {
    this[locatorSym] = locator;
    this[maxRecursionSym] = clamp(maxRecursion, 2, 10);
    PbjxEvent.setPbjx(this);
  }

  /**
   * Triggers lifecycle events using the dispatcher which will announce an event for each of:
   *
   * @gdbots/pbjx/message.suffix
   * mixin:v[MAJOR VERSION].suffix
   * mixin.suffix
   * curie:v[MAJOR VERSION].suffix
   * curie.suffix
   *
   * When the recursive option is used, any fields with MessageType will also be run through
   * the trigger process. The PbjxEvent object will have a reference to the parent event
   * and the depth of the recursion.
   *
   * @param {Message}    message   The message that will be processed.
   * @param {string}     suffix    A string indicating the lifecycle phase
   *                               (bind, validate, enrich, etc.)
   * @param {?PbjxEvent} event     An event object containing the message.
   * @param {boolean}    recursive If true, all field values with MessageType are also triggered.
   * @param {boolean}    throwEx   If true, exceptions are thrown, otherwise they are logged.
   *
   * @returns {Pbjx}
   *
   * @throws {GdbotsPbjxException}
   * @throws {InvalidArgumentException}
   * @throws {TooMuchRecursion}
   * @throws {Exception}
   */
  async trigger(message, suffix, event = null, recursive = true, throwEx = false) {
    const fsuffix = `.${trim(suffix, '.')}`;
    if (fsuffix === '.') {
      throw new InvalidArgumentException('Trigger requires a non-empty suffix.');
    }

    const fevent = event || new PbjxEvent(message);
    const schema = message.schema();

    if (fevent.getDepth() > this[maxRecursionSym]) {
      throw new TooMuchRecursion('Pbjx.trigger encountered a schema that is too complex ' +
        'or a nested message is being referenced multiple times in ' +
        `the same tree.  Max recursion: ${this[maxRecursionSym]}, Current schema is "${schema.getId()}".`,
      );
    }

    if (recursive && fevent.supportsRecursion()) {
      const nested = getNestedMessages(message, schema);
      const l = nested.length;
      for (let i = 0; i < l; i += 1) {
        if (nested[i].isFrozen()) {
          continue;
        }

        await this.trigger(nested[i], fsuffix, fevent.createChildEvent(nested[i]), recursive);
      }
    }

    const dispatcher = await this[locatorSym].getDispatcher();
    const events = [`${EVENT_PREFIX}message${fsuffix}`].concat(getEventNames(message, fsuffix));

    const l = events.length;
    for (let i = 0; i < l; i += 1) {
      try {
        await dispatcher.dispatch(events[i], fevent);
      } catch (e) {
        if (throwEx) {
          throw e;
        }
        const exceptionHandler = await this[locatorSym].getExceptionHandler();
        await exceptionHandler.onTriggerException(fevent, events[i], e);
      }
    }

    return this;
  }

  /**
   * Runs the "standard" lifecycle for a message prior to send, publish or request.
   * Internally this is a call to Pbjx::trigger for suffixes bind, validate and enrich.
   *
   * After the lifecycle completes the message should be ready to be sent via a transport
   * or frozen and persisted to storage.
   *
   * @param {Message} message
   * @param {boolean} recursive
   *
   * @returns {Pbjx}
   *
   * @throws {Exception}
   */
  async triggerLifecycle(message, recursive = true) {
    if (message.isFrozen()) {
      return this;
    }

    const event = new PbjxEvent(message);
    await this.trigger(message, SUFFIX_BIND, event, recursive);
    await this.trigger(message, SUFFIX_VALIDATE, event, recursive);
    await this.trigger(message, SUFFIX_ENRICH, event, recursive);
    return this;
  }

  /**
   * Copies context fields (ip, user agent, correlator, etc.) from one message to another.
   *
   * @param {Message} from
   * @param {Message} to
   *
   * @returns {Pbjx}
   */
  async copyContext(from, to) {
    if (to.isFrozen()) {
      return this;
    }

    const schema = to.schema();

    if (!to.has('ctx_causator_ref') && schema.hasField('ctx_causator_ref')) {
      to.set('ctx_causator_ref', from.generateMessageRef());
    }

    if (!to.has('ctx_app') && from.has('ctx_app') && schema.hasField('ctx_app')) {
      to.set('ctx_app', await from.get('ctx_app').clone());
    }

    if (!to.has('ctx_cloud') && from.has('ctx_cloud') && schema.hasField('ctx_cloud')) {
      to.set('ctx_cloud', await from.get('ctx_cloud').clone());
    }

    const simple = [
      'ctx_tenant_id',
      'ctx_correlator_ref',
      'ctx_user_ref',
      'ctx_ip',
      'ctx_ipv6',
      'ctx_ua',
      'ctx_msg',
    ];

    simple.forEach((field) => {
      if (!to.has(field) && from.has(field) && schema.hasField(field)) {
        to.set(field, from.get(field));
      }
    });

    return this;
  }

  /**
   * Processes a command asynchronously.
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   *
   * @returns {Promise}
   */
  async send(command) {
    if (!command.schema().hasMixin('gdbots:pbjx:mixin:command')) {
      throw new InvalidArgumentException('Pbjx.send() requires a message using "gdbots:pbjx:mixin:command".');
    }

    await this.triggerLifecycle(command);
    const bus = await this[locatorSym].getCommandBus();
    return bus.send(command);
  }

  /**
   * Publishes events to all subscribers.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @returns {Promise}
   */
  async publish(event) {
    if (!event.schema().hasMixin('gdbots:pbjx:mixin:event')) {
      throw new InvalidArgumentException('Pbjx.publish() requires a message using "gdbots:pbjx:mixin:event".');
    }

    await this.triggerLifecycle(event);
    const bus = await this[locatorSym].getEventBus();
    return bus.publish(event);
  }

  /**
   * Processes a request synchronously and returns the response.
   *
   * @param {Message} req - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   *
   * @returns {Promise.<Message>} Resolves with a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async request(req) {
    if (!req.schema().hasMixin('gdbots:pbjx:mixin:request')) {
      throw new InvalidArgumentException('Pbjx.request() requires a message using "gdbots:pbjx:mixin:request".');
    }

    await this.triggerLifecycle(req);
    const event = new GetResponseEvent(req);
    await this.trigger(req, SUFFIX_BEFORE_HANDLE, event, false);

    if (event.hasResponse()) {
      return event.getResponse();
    }

    const bus = await this[locatorSym].getRequestBus();
    const response = await bus.request(req);
    event.setResponse(response);

    if (response.schema().getCurie().toString() === 'gdbots:pbjx:request:request-failed-response') {
      throw new RequestHandlingFailed(response);
    }

    try {
      const createdEvent = new ResponseCreatedEvent(req, response);
      await this.trigger(req, SUFFIX_AFTER_HANDLE, createdEvent, false);
      await this.trigger(response, SUFFIX_CREATED, createdEvent, false);
    } catch (e) {
      const exceptionHandler = await this[locatorSym].getExceptionHandler();
      await exceptionHandler.onRequestBusException(new BusExceptionEvent(response, e));
      throw e;
    }

    return response;
  }
}
