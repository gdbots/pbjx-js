import HealthCheckedV1 from '@gdbots/schemas/gdbots/pbjx/event/HealthCheckedV1.js';

export default class CheckHealthHandler {
  async handleCommand(command, pbjx) {
    const event = HealthCheckedV1.create().set('msg', command.get('msg'));
    await pbjx.copyContext(command, event);
    return pbjx.publish(event);
  }
}
