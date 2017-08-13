import test from 'tape';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1';
import Container from './fixtures/Container';
import ContainerAwareServiceLocator from '../src/ContainerAwareServiceLocator';
import EchoRequestHandler from '../src/EchoRequestHandler';
import Pbjx from '../src/Pbjx';
import curieToHandlerServiceId from '../src/utils/curieToHandlerServiceId';

test('ContainerAwareServiceLocator tests', (t) => {
  const container = new Container();
  const pbjx = new Pbjx();
  container.set('pbjx', pbjx);

  const locator = new ContainerAwareServiceLocator(container);
  t.true(locator.getPbjx() === pbjx);

  const requestHandler = new EchoRequestHandler();
  const requestCurie = EchoRequestV1.schema().getCurie();
  //const request = EchoRequestV1.create();
  container.set(curieToHandlerServiceId(requestCurie), requestHandler);
  t.true(locator.getRequestHandler(requestCurie) === requestHandler);

  t.end();
});
