/* eslint-disable class-methods-use-this */
import HealthCheckedV1 from '@gdbots/schemas/gdbots/pbjx/event/HealthCheckedV1';
import CommandHandler from './CommandHandler';

export default class CheckHealthHandler extends CommandHandler {
  async handleCommand(command, pbjx) {
    const event = HealthCheckedV1.create().set('msg', command.get('msg'));
    return pbjx.copyContext(command, event).publish(event);
  }
}