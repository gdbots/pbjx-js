require('@babel/register')({
  ignore: [/node_modules\/(?!@gdbots|lodash-es)/],
});

require('@gdbots/acme-schemas');
