import test from 'tape';
import getConfig from '../../../src/aws/lambda/getConfig';


test('getConfig tests', async (t) => {
  const paramMap = {
    '/acme/test/param1': 'param1',
    '/acme/test/param2': 'param2',
    '/acme/test/param3': 'param3',
    '/acme/test/invalid-param': 'invalidParam',
  };

  const ssm = {
    getParameters: (params, callback) => {
      t.same(params.Names, Object.keys(paramMap));
      callback(null, {
        Parameters: [
          {
            Name: params.Names[0],
            Value: 'val1',
          },
          {
            Name: params.Names[1],
            Value: 'val2',
          },
          {
            Name: params.Names[2],
            Type: 'StringList',
            Value: 'item1,item2,item3',
          },
        ],
        InvalidParameters: [params.Names[3]],
      });
    },
  };

  let config;

  try {
    config = await getConfig(ssm, paramMap);
    // t.same(JSON.stringify(config), '1');
    t.true(config.pbjxLoaded);
    t.same(config.param1, 'val1');
    t.same(config.param2, 'val2');
    t.same(config.param3, ['item1', 'item2', 'item3']);
    t.same(config.invalidParam, null);
    t.same(config.pbjxInvalidParams, ['/acme/test/invalid-param']);
  } catch (e) {
    t.fail(e.message);
  }

  try {
    const cachedConfig = await getConfig({
      getParameters: () => t.fail('config should be cached.'),
    }, {});
    t.same(cachedConfig, config);
  } catch (e) {
    t.fail(e.message);
  }

  t.end();
});
