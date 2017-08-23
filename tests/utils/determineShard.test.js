import test from 'tape';
import determineShard from '../../src/utils/determineShard';

test('determineShard tests', (t) => {
  t.same(determineShard('test'), 143);
  t.same(determineShard('test', 256), 143);
  t.same(determineShard('test', 32), 15);
  t.same(determineShard('test', 16), 15);
  t.same(determineShard('test', 65535), 2447);

  t.same(determineShard('4ab60690-7d66-11e7-bb31-be2e44b06b34'), 6);
  t.same(determineShard('4ab60690-7d66-11e7-bb31-be2e44b06b34', 256), 6);
  t.same(determineShard('4ab60690-7d66-11e7-bb31-be2e44b06b34', 32), 6);
  t.same(determineShard('4ab60690-7d66-11e7-bb31-be2e44b06b34', 16), 6);
  t.same(determineShard('4ab60690-7d66-11e7-bb31-be2e44b06b34', 65535), 36102);

  t.same(determineShard('(╯°□°)╯︵ ┻━┻, ice 🍦 poop 💩 doh 😳'), 50);
  t.same(determineShard('(╯°□°)╯︵ ┻━┻, ice 🍦 poop 💩 doh 😳', 256), 50);
  t.same(determineShard('(╯°□°)╯︵ ┻━┻, ice 🍦 poop 💩 doh 😳', 32), 18);
  t.same(determineShard('(╯°□°)╯︵ ┻━┻, ice 🍦 poop 💩 doh 😳', 16), 2);
  t.same(determineShard('(╯°□°)╯︵ ┻━┻, ice 🍦 poop 💩 doh 😳', 65535), 13362);

  t.end();
});
