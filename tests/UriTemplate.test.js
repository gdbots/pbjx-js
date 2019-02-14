import test from 'tape';
import AcmeForm from '@gdbots/acme-schemas/acme/forms/node/FormV1';
import createSlug from '@gdbots/common/createSlug';
import { uriTemplateExpand, pbjUrl, registerTemplates, registerGlobals } from '../src/UriTemplate';

const node = AcmeForm.create();

test('pbjUrl from UriTemplate[invalid node provided]', (t) => {
  t.throws(() => pbjUrl('string'));

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
    'acme:form.embed' : 'https://instagram.com/p/{media_id}'
  });

  // no template vars provided
  let actual = pbjUrl(node, 'embed');
  let expected = 'https://instagram.com/p/';
  t.same(actual, expected);

  t.end();
});

test('pbjUrl from UriTemplate[generated template vars]', (t) => {
  const slug = createSlug('i am the form');
  node.set('slug', slug);

  registerGlobals({
    'web_base_url'  : 'https://www.tmz.com/',
    'share_base_url' : 'https://share.tmz.com/',
  });
  registerTemplates({
    'acme:form.canonical' : '{+web_base_url}{+slug}/{_id}/{title}',
    'acme:form.videos' : '{+share_base_url}categories/{slug}/videos/',
  });

  let actual = pbjUrl(node, 'canonical');
  let expected = `https://www.tmz.com/${slug}/${node.get('_id')}/`;
  t.same(actual, expected);

  actual = pbjUrl(node, 'videos');
  expected = `https://share.tmz.com/categories/${slug}/videos/`;
  t.same(actual, expected);

  t.end();
});

test('uriTemplateExpand from UriTemplate[no templates provided]', (t) => {
  let actual = uriTemplateExpand('acme:form.hello');
  t.false(actual);

  t.end();
});


test('uriTemplateExpand from UriTemplate[templates provided]', (t) => {
  registerTemplates({
    'acme:form.embed' : 'https://instagram.com/p/{media_id}/{_id}'
  });

  let actual = uriTemplateExpand('acme:form.embed', {media_id: 21, _id: 'blaaah'});
  let expected = 'https://instagram.com/p/21/blaaah';
  t.same(actual, expected);

  t.end();
});
