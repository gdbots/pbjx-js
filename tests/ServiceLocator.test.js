import test from 'tape';
import Pbjx from '../src/Pbjx';
import ServiceLocator from '../src/ServiceLocator';

test('ServiceLocator tests', (t) => {
  const locator = new ServiceLocator();

  t.true(locator.getPbjx() instanceof Pbjx);

  t.end();
});
