import test from 'tape';
import AcmeForm from '@gdbots/acme-schemas/acme/forms/node/FormV1';
import createSlug from '@gdbots/common/createSlug';
import { pbjUrl, registerTemplates, registerGlobals } from '../src/UriTemplate';

const node = AcmeForm.create();

test('pbjUrl from UriTemplate[invalid node provided]', (t) => {
  t.throws(() => pbjUrl('hello'));

  t.throws(() => pbjUrl(null));

  t.throws(() => pbjUrl());

  t.throws(() => pbjUrl({}));

  t.end();
});

test('pbjUrl from UriTemplate[no templates provided]', (t) => {
  registerTemplates();

  const actual = pbjUrl(node, 'canonical');
  t.false(actual);
  t.end();
});

test('pbjUrl from UriTemplate[templates provided]', (t) => {
  registerTemplates({
    'acme:form.embed': 'https://instagram.com/p/{media_id}',
  });

  // no template vars provided
  const actual = pbjUrl(node, 'embed');
  const expected = 'https://instagram.com/p/';
  t.same(actual, expected);

  t.end();
});

test('pbjUrl from UriTemplate[overriding templates]', (t) => {
  registerTemplates({
    'acme:form.another': 'https://instagram.com/p/{media_id}',
  });
  // at some point we re-register another template with same key
  registerTemplates({
    'acme:form.another': 'https://instagram.com/another/p/{media_id}',
  });

  const actual = pbjUrl(node, 'another');
  // expecting the last one
  const expected = 'https://instagram.com/another/p/';
  t.same(actual, expected);

  t.end();
});

test('pbjUrl from UriTemplate[generated template vars]', (t) => {
  const slug = createSlug('i am the form');
  node.set('slug', slug);

  registerGlobals({
    web_base_url: 'https://www.tmz.com/',
    share_base_url: 'https://share.tmz.com/',
  });
  registerTemplates({
    'acme:form.canonical': '{+web_base_url}{+slug}/{_id}/{title}',
    'acme:form.videos': '{+share_base_url}categories/{slug}/videos/',
  });

  let actual = pbjUrl(node, 'canonical');
  let expected = `https://www.tmz.com/${slug}/${node.get('_id')}/`;
  t.same(actual, expected);

  actual = pbjUrl(node, 'videos');
  expected = `https://share.tmz.com/categories/${slug}/videos/`;
  t.same(actual, expected);

  t.end();
});
