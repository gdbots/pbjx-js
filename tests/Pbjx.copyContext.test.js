import test from 'tape';
import MessageRef from '@gdbots/pbj/well-known/MessageRef.js';
import AppV1 from '@gdbots/schemas/gdbots/contexts/AppV1.js';
import CloudV1 from '@gdbots/schemas/gdbots/contexts/CloudV1.js';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1.js';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator.js';

test('Pbjx.copyContext tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = await locator.getPbjx();

  const from = EchoRequestV1.create();
  const to = EchoRequestV1.create();
  const app = AppV1.create()
    .set('vendor', 'gdbots')
    .set('name', 'pbjx');
  const cloud = CloudV1.create()
    .set('provider', 'aws')
    .set('region', 'us-west-2');
  const ref = MessageRef.fromString('acme:iam:node:user:123');

  from.set('ctx_app', app);
  from.set('ctx_cloud', cloud);
  from.set('ctx_correlator_ref', ref);
  from.set('ctx_user_ref', ref);
  from.set('ctx_ip', '10.0.0.1');
  from.set('ctx_ipv6', '2001:db8:85a3:8d3:1319:8a2e:370:7348');
  from.set('ctx_ua', 'test-runner');
  from.set('ctx_tenant_id', 'tenantid');

  await pbjx.copyContext(from, to);
  t.same(from.generateMessageRef(), to.get('ctx_causator_ref'));
  t.same(`${from.get('ctx_app')}`, `${to.get('ctx_app')}`, 'ctx_app should be the same when serialized.');
  t.false(from.get('ctx_app') === to.get('ctx_app'), 'ctx_app should NOT be the same instance.');
  t.same(`${from.get('ctx_cloud')}`, `${to.get('ctx_cloud')}`, 'ctx_cloud should be the same when serialized.');
  t.false(from.get('ctx_cloud') === to.get('ctx_cloud'), 'ctx_cloud should NOT be the same instance.');
  t.same(from.get('ctx_correlator_ref'), to.get('ctx_correlator_ref'));
  t.same(from.get('ctx_user_ref'), to.get('ctx_user_ref'));
  t.same(from.get('ctx_ip'), to.get('ctx_ip'));
  t.same(from.get('ctx_ipv6'), to.get('ctx_ipv6'));
  t.same(from.get('ctx_ua'), to.get('ctx_ua'));
  t.same(from.get('ctx_tenant_id'), to.get('ctx_tenant_id'));

  t.end();
});
