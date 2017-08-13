import HealthCheckedV1 from '@gdbots/schemas/gdbots/pbjx/event/HealthCheckedV1';
import CommandHandler from './CommandHandler';

export default class CheckHealthHandler extends CommandHandler {
  /**
   * {@inheritDoc}
   */
  handleCommand(command, pbjx) {
    const event = HealthCheckedV1.create().set('msg', command.get('msg'));
    pbjx.copyContext(command, event).publish(event);
  }
}
