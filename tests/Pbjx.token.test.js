import test from 'tape';
import PbjxToken from '../src/PbjxToken';


test('PbjxToken tests', (t) => {
  const jwtKid = 'myKid1';
  const host = 'pbjxdev.com';
  const secret = 'segdg4twsgsg';
  const content = JSON.stringify(['envelope1', 'envelope2']);
  const pbjxToken = PbjxToken.create(host, JSON.stringify(content), jwtKid, secret);

  t.ok(pbjxToken);
  if (pbjxToken.getHeader().kid) {
    t.equal(pbjxToken.getHeader().kid, jwtKid);
  }

  t.end();
});


test('PbjxToken.verify (passing) tests', (t) => {
  const jwtKid = 'myKid1';
  const host = 'pbjxdev.com';
  const secret = 'segdg4twsgsg';
  const content = JSON.stringify(['envelope1', 'envelope2']);
  const pbjxToken = PbjxToken.create(host, JSON.stringify(content), jwtKid, secret);

  t.ok(pbjxToken.verify(secret));
  t.equal(pbjxToken.getHeader().kid, jwtKid);
  t.end();
});


test('PbjxToken.verify (failing) tests', (t) => {
  const jwtKid = 'myKid1';
  const host = 'pbjxdev.com';
  const secret = 'segdg4twsgsg';
  const content = JSON.stringify(['envelope1', 'envelope2']);
  const pbjxToken = PbjxToken.create(host, JSON.stringify(content), jwtKid, secret);

  t.notOk(pbjxToken.verify('not the secret'));
  t.equal(pbjxToken.getHeader().kid, jwtKid);
  t.end();
});


test('PbjxToken expired tests', (t) => {
  const expiredToken = 'eyJwYXlsb2FkX2hhc2giOiIxdWpJZ0VNbFdIdWRNN3A3SkpKR0JRMzdSZFwvVlRXUUZaN3Q4am84VWgyUT0iLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJob3N0IjoidG16ZGV2LmNvbSIsImV4cCI6NjB9.LWOQpMgIw0b-oqTaEarZWncQvJCGY50lTV4Gh2GLHhw';
  try {
    PbjxToken(expiredToken);
    t.fail('Expired token was decoded');
  } catch (ex) {
    t.pass('expired token will not be decoded by PbjxToken');
  }
  t.end();
});
