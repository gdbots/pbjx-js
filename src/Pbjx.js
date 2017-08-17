/* eslint-disable */
import clamp from 'lodash/clamp';
import trim from 'lodash/trim';
import EchoResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoResponseV1';
import getEventNames from './utils/getEventNames';
import InvalidArgumentException from './exceptions/InvalidArgumentException';
import PbjxEvent from './events/PbjxEvent';
import TooMuchRecursion from './exceptions/TooMuchRecursion';
import { EVENT_NAMESPACE, SUFFIX_BIND, SUFFIX_ENRICH, SUFFIX_VALIDATE } from './pbjxEvents';

const dispatcher = Symbol('dispatcher');
const locatorSym = Symbol('locator');
const maxRecursionSym = Symbol('maxRecursion');

/**
 * @param {Message} message
 * @param {Schema}  schema
 *
 * @returns {Message[]}
 */
const getNestedMessages = (message, schema) => {
  let messages = [];

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
    this[dispatcher] = locator.getDispatcher();
    this[locatorSym] = locator;
    this[maxRecursionSym] = clamp(maxRecursion, 2, 10);
    PbjxEvent.setPbjx(this);
  }

  /**
   * Triggers lifecycle events using the dispatcher which will announce an event for each of:
   *
   * gdbots_pbjx.message.suffix
   * curie:v[MAJOR VERSION].suffix
   * curie.suffix
   * mixinId.suffix (mixinId is the mixin with the major rev)
   * mixinCurie.suffix (mixinCurie is the curie ONLY)
   *
   * When the recursive option is used, any fields with MessageType will also be run through
   * the trigger process.  The PbjxEvent object will have a reference to the parent event
   * and the depth of the recursion.
   *
   * @param {Message}    message   The message that will be processed.
   * @param {string}     suffix    A string indicating the lifecycle phase
   *                               (bind, validate, enrich, etc.)
   * @param {?PbjxEvent} event     An event object containing the message.
   * @param {boolean}    recursive If true, all field values with MessageType are also triggered.
   *
   * @returns {Pbjx}
   *
   * @throws {GdbotsPbjxException}
   * @throws {InvalidArgumentException}
   * @throws {TooMuchRecursion}
   * @throws {Exception}
   */
  trigger(message, suffix, event = null, recursive = true) {
    const fsuffix = `.${trim(suffix, '.')}`;
    if (fsuffix === '.') {
      throw new InvalidArgumentException('Trigger requires a non-empty suffix.');
    }

    const fevent = event || new PbjxEvent(message);
    const schema = message.schema();

    if (fevent.getDepth() > this[maxRecursionSym]) {
      throw new TooMuchRecursion('Pbjx::trigger encountered a schema that is too complex ' +
        'or a nested message is being referenced multiple times in ' +
        `the same tree.  Max recursion: ${this[maxRecursionSym]}, Current schema is "${schema.getId()}".`
      );
    }

    if (recursive && fevent.supportsRecursion()) {
      getNestedMessages(message, schema).forEach((nestedMessage) => {
        if (nestedMessage.isFrozen()) {
          return;
        }

        this.trigger(nestedMessage, fsuffix, fevent.createChildEvent(nestedMessage), recursive);
      });
    }

    this[dispatcher].dispatch(`${EVENT_NAMESPACE}message${fsuffix}`, fevent);
    getEventNames(message, fsuffix).forEach(eventName => {
      this[dispatcher].dispatch(eventName, fevent);
    });

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
  triggerLifecycle(message, recursive = true) {
    if (message.isFrozen()) {
      return this;
    }

    const event = new PbjxEvent(message);
    this.trigger(message, SUFFIX_BIND, event, recursive);
    this.trigger(message, SUFFIX_VALIDATE, event, recursive);
    this.trigger(message, SUFFIX_ENRICH, event, recursive);
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
  copyContext(from, to) {
    if (to.isFrozen()) {
      return this;
    }

    if (!to.has('ctx_causator_ref')) {
      to.set('ctx_causator_ref', from.generateMessageRef());
    }

    if (!to.has('ctx_app') && from.has('ctx_app')) {
      to.set('ctx_app', from.get('ctx_app').clone());
    }

    if (!to.has('ctx_cloud') && from.has('ctx_cloud')) {
      to.set('ctx_cloud', from.get('ctx_cloud').clone());
    }

    ['ctx_correlator_ref', 'ctx_user_ref', 'ctx_ip', 'ctx_ua'].forEach((ctx) => {
      if (!to.has(ctx) && from.has(ctx)) {
        to.set(ctx, from.get(ctx));
      }
    });

    return this;
  }

  /**
   * Processes a command asynchronously.
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async send(command) {
    this.triggerLifecycle(command);
    return this[locatorSym].getCommandBus().send(command);
  }

  /**
   * Publishes events to all subscribers.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async publish(event) {
    console.log('publish', `${event}`);
    return this[locatorSym].getEventBus().publish(event);
  }

  /**
   * Processes a request synchronously and returns the response.
   *
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   *
   * @returns {Message} Returns a message using mixin 'gdbots:pbjx:mixin:response'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async request(request) {
    console.log('request', `${request}`);
    return await EchoResponseV1.create().set('msg', 'test');
  }
}
