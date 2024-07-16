console.log('bootstrap.cjs');
require('@babel/register')({});
(async() => {
  await import('@gdbots/acme-schemas');
})();
