import test from 'tape';
import PbjxToken from '../src/PbjxToken';

const host = 'pbjxdev.com';
const secret = 'segdg4twsgsg';
const content = ['envelope1', 'envelope2'];
const pbjxToken = PbjxToken.create(host, JSON.stringify(content), secret);

test('Created Valid JWT token', (t) => {
  t.ok(pbjxToken);
  t.end();
});

test('Verifying JWT token with correct secret', (t) => {
  const res = pbjxToken.verify(secret);
  t.ok(res);
  t.end();
});

test('Verifying JWT token with in-correct secret', (t) => {
  const res = pbjxToken.verify('not the secret');
  t.notOk(res);
  t.end();
});

test('Validating expired token is in invalid', (t) => {
  const expiredToken = 'eyJwYXlsb2FkX2hhc2giOiIxdWpJZ0VNbFdIdWRNN3A3SkpKR0JRMzdSZFwvVlRXUUZaN3Q4am84VWgyUT0iLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJob3N0IjoidG16ZGV2LmNvbSIsImV4cCI6NjB9.LWOQpMgIw0b-oqTaEarZWncQvJCGY50lTV4Gh2GLHhw';
  try {
    PbjxToken(expiredToken);
    t.fail('Expired token was decoded');
  } catch (ex) {
    t.pass('expired token will not be decoded by PbjxToken');
  }
  t.end();
});
