export default class EventBus {
  /**
   * @param {ServiceLocator} locator
   * @param {Transport} transport
   */
  constructor(locator, transport) {
    Object.defineProperty(this, 'locator', { value: locator });
    Object.defineProperty(this, 'transport', { value: transport });
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
    return this.transport.sendEvent(event.freeze());
  }

  /**
   * Processes an event directly.  DO NOT use this method in the application as this
   * is intended for the transports, consumers and workers of the Pbjx system.
   *
   * Publishes the event to all subscribers using the dispatcher, which processes
   * events in memory.  If any events throw an exception an EventExecutionFailed
   * event will be published.
   *
   * @internal
   * @package
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   */
  async receiveEvent(event) {
    return this.locator
      .getDispatcher()
      .getListeners(event.schema().getCurie().toString())
      .map(l => l(event, this));

    //
    // event.freeze();
    //
    // // promise all for all publishing...
    // const promises = [];
    // getEventNames(event, '', true).forEach(eventName => {
    //   dispatcher.dispatch(eventName, fevent);
    //   promises.push()
    // });
  }

  async dispatch(eventName, event) {
    const dispatcher = this.locator.getDispatcher();
    dispatcher.dispatch(eventName, event);
    // $listeners = $this->dispatcher->getListeners($eventName);
    // foreach ($listeners as $listener) {
    //     try {
    //         call_user_func($listener, $event, $this->pbjx);
    //     } catch (\Exception $e) {
    //         if ($event instanceof EventExecutionFailed) {
    //             $this->locator->getExceptionHandler()->onEventBusException(
    // new BusExceptionEvent($event, $e));
    //             return;
    //         }
    //
    //         $code = $e->getCode() > 0 ? $e->getCode() : Code::UNKNOWN;
    //
    //         $failedEvent = EventExecutionFailedV1::create()
    //             ->set('event', $event)
    //             ->set('error_code', $code)
    //             ->set('error_name', ClassUtils::getShortName($e))
    //             ->set('error_message', substr($e->getMessage(), 0, 2048))
    //             ->set('stack_trace', $e->getTraceAsString());
    //
    //         if ($e->getPrevious()) {
    //             $failedEvent
    // ->set('prev_error_message', substr($e->getPrevious()->getMessage(), 0, 2048));
    //         }
    //
    //         $this->pbjx->copyContext($event, $failedEvent);
    //
    //         // running in process for now
    //         $this->receiveEvent($failedEvent);
    //     }
    // }
  }
}
