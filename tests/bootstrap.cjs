console.log('bootstrap.cjs');
require('@babel/register').default({});
(async() => {
  await import('@gdbots/acme-schemas');
})();
