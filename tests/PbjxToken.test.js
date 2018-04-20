import test from 'tape';
import PbjxToken from '../src/PbjxToken';


test('PbjxToken tests', (t) => {
  const content = 'content';
  const aud = 'https://local.dev/pbjx';
  const kid = 'kid';
  const secret = 'secret';

  // hijack Date.now so the time based functions are predictable
  const originalNow = Date.now;
  Date.now = () => 1509836741000;

  // for this test, we need to provide options so we can
  // make assertions on the generated values.
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 120;
  const iat = now;

  const pbjxToken = PbjxToken.create(content, aud, kid, secret, { iat });

  const expectedJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZCJ9.eyJhdWQiOiJodHRwczovL2xvY2FsLmRldi9wYmp4IiwiZXhwIjoxNTA5ODM2ODYxLCJpYXQiOjE1MDk4MzY3NDEsImp0aSI6IjZjYTk1OTRmNDQyZmY4YWFhNTUxNWJlMDFiMjRmZDE1MGIwYTI1ODdiNGI4ZWQwYTE1NzQ3YzQ0ZTk0MmIwZWYifQ.rP0d7suRJw1rjuOWb8zVsad2fCvE1qByC_xh-xIFC7U';
  const expectedJti = '6ca9594f442ff8aaa5515be01b24fd150b0a2587b4b8ed0a15747c44e942b0ef';

  t.true(pbjxToken instanceof PbjxToken);
  t.same(pbjxToken.getAud(), aud);
  t.same(pbjxToken.getExp(), exp);
  t.same(pbjxToken.getIat(), iat);
  t.same(pbjxToken.getJti(), expectedJti);
  t.same(pbjxToken.getKid(), kid);
  t.same(pbjxToken.getSignature(), expectedJwt.split('.').pop());
  t.same(pbjxToken.toString(), expectedJwt);
  t.same(JSON.stringify(pbjxToken.toString()).replace(/"/g, ''), expectedJwt);
  t.true(pbjxToken.verify(secret), 'should verify with correct secret');
  t.false(pbjxToken.verify('invalid'), 'should NOT verify with incorrect secret');

  Date.now = originalNow;

  // now ensure that exp works without Date.now hijacked
  try {
    PbjxToken.fromString(expectedJwt);
    t.fail('Expired token was allowed to be created.');
  } catch (ex) {
    t.pass('Unable to create an instance from an expired token.');
  }

  t.end();
});
