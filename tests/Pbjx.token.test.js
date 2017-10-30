import test from 'tape';
import PbjxToken from '../src/PbjxToken';

// fixme: these generally go into the test case
const host = 'pbjxdev.com';
const secret = 'segdg4twsgsg';
// fixme: content should be a string
const content = ['envelope1', 'envelope2'];
const pbjxToken = PbjxToken.create(host, JSON.stringify(content), secret);


test('PbjxToken tests', (t) => {
  t.ok(pbjxToken);
  t.end();
});


test('PbjxToken.verify (passing) tests', (t) => {
  t.ok(pbjxToken.verify(secret));
  t.end();
});


test('PbjxToken.verify (failing) tests', (t) => {
  t.notOk(pbjxToken.verify('not the secret'));
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
