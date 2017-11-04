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
  const exp = now + 5;
  const iat = now;

  const pbjxToken = PbjxToken.create(content, aud, kid, secret, { iat });

  const expectedJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZCJ9.eyJhdWQiOiJodHRwczovL2xvY2FsLmRldi9wYmp4IiwiZXhwIjoxNTA5ODM2NzQ2LCJpYXQiOjE1MDk4MzY3NDEsImp0aSI6IjM4YTc0NzEwNTA0YmZmMTI5NDVmMzZkNzU2MDg1Mjc2NzY4MzkyOTdlMmExNjA2ZjkyYTk4MTYzM2UyNDdhNTEifQ.Z_kjrc7zUT14sz9OPsEfPLYHIzjJ0ANQS9hyIJ2GLjk';
  const expectedJti = '38a74710504bff12945f36d75608527676839297e2a1606f92a981633e247a51';

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

  //t.f();

  Date.now = originalNow;
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
