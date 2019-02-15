import test from 'tape';
import AcmeForm from '@gdbots/acme-schemas/acme/forms/node/FormV1';
import pbjUrl, { expand, registerGlobal, registerGlobals, registerTemplate, registerTemplates } from '../src/pbjUrl';


test('pbjUrl tests', (t) => {
  registerGlobals({
    web_base_url: 'https://www.acme.com/',
  });

  registerGlobal('amp_base_url', 'https://amp.acme.com/');

  registerTemplates({
    'acme:form.amp': '{+amp_base_url}{slug}/',
    'acme:form.canonical': '{+web_base_url}{+slug}/{_id}/',
  });

  const pbj = AcmeForm.create();
  pbj.set('slug', 'i-am-a-form');

  let actual = pbjUrl(pbj, 'canonical');
  let expected = `https://www.acme.com/${pbj.get('slug')}/${pbj.get('_id')}/`;
  t.same(actual, expected);

  actual = pbjUrl(pbj, 'amp');
  expected = `https://amp.acme.com/${pbj.get('slug')}/`;
  t.same(actual, expected);

  actual = pbjUrl(pbj, 'unknown');
  expected = null;
  t.same(actual, expected);

  pbj.clear('slug');
  actual = pbjUrl(pbj, 'canonical');
  expected = `https://www.acme.com//${pbj.get('_id')}/`;
  t.same(actual, expected);

  actual = pbjUrl(null, 'canonical');
  expected = null;
  t.same(actual, expected);

  registerTemplate('test', '/{test}/');
  actual = expand('test', { test: 'abc' });
  expected = '/abc/';
  t.same(actual, expected);

  t.end();
});


test('pbjUrl (template override) tests', (t) => {
  registerTemplates({
    'acme:form.another': 'https://instagram.com/p/{media_id}',
  });

  registerTemplates({
    'acme:form.another': 'https://instagram.com/another/p/{media_id}',
  });

  const pbj = AcmeForm.create();
  const actual = pbjUrl(pbj, 'another');
  const expected = 'https://instagram.com/another/p/';
  t.same(actual, expected);

  t.end();
});
