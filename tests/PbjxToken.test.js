import test from 'tape';
import PbjxToken from '../src/PbjxToken';

test('JWT HMAC SHA256 Token', (t) => {
  t.test('Creating JWT token');
  const host = 'tmzdev.com';
  const secret = 'segdg4twsgsg';
  const content = ['envelope1', 'envelope2'];
  const pbjxToken = PbjxToken.create(host, JSON.stringify(content), secret);

  t.test('Verifying JWT token with correct secret');
  let res = pbjxToken.verify(secret);
  t.equal(res, true);

  t.test('Attempting to verify JWT token with in-correct secret');
  res = pbjxToken.verify('not the secret');
  t.equal(res, false);

  t.test('Validating payload hash');
  const expectedHash = pbjxToken.getPayload().pbjx;
  const generatedHash = PbjxToken.getPayloadHash(JSON.stringify(content), secret);
  t.equal(expectedHash, generatedHash);


  t.test("Validating expired token is in invalid");
  const expiredToken = 'eyJwYXlsb2FkX2hhc2giOiIxdWpJZ0VNbFdIdWRNN3A3SkpKR0JRMzdSZFwvVlRXUUZaN3Q4am84VWgyUT0iLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJob3N0IjoidG16ZGV2LmNvbSIsImV4cCI6NjB9.LWOQpMgIw0b-oqTaEarZWncQvJCGY50lTV4Gh2GLHhw';
  try {
    new PbjxToken(expiredToken);
    t.fail("Expired token was decoded");
  } catch(ex) {
    t.pass("expired token will not be decoded by PbjxToken");
  }

  t.test("Test HTTP Header generation");
  const headerValue = pbjxToken.toHttpHeader();
  const expectedHeaderValue = 'Token ' + pbjxToken.getToken();
  t.equal(headerValue, expectedHeaderValue);

  t.end();
});
