import test from 'tape';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1.js';
import Container from './fixtures/Container.js';
import ContainerAwareServiceLocator from '../src/ContainerAwareServiceLocator.js';
import EchoRequestHandler from '../src/EchoRequestHandler.js';
import Pbjx from '../src/Pbjx.js';
import curieToHandlerServiceId from '../src/utils/curieToHandlerServiceId.js';
import { serviceIds } from '../src/constants.js';

test('ContainerAwareServiceLocator tests', async (t) => {
  const container = new Container();
  const locator = new ContainerAwareServiceLocator(container);
  const pbjx = new Pbjx(locator);
  container.set(serviceIds.PBJX, pbjx);

  t.true(await locator.getPbjx() === pbjx);

  const requestHandler = new EchoRequestHandler();
  const requestCurie = EchoRequestV1.schema().getCurie();
  container.set(curieToHandlerServiceId(requestCurie), requestHandler);
  t.true((await locator.getRequestHandler(requestCurie)) === requestHandler);

  t.end();
});
