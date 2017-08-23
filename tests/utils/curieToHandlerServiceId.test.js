import test from 'tape';
import SchemaCurie from '@gdbots/pbj/SchemaCurie';
import curieToHandlerServiceId from '../../src/utils/curieToHandlerServiceId';

test('curieToHandlerServiceId tests', (t) => {
  t.same(
    curieToHandlerServiceId(SchemaCurie.fromString('acme:blog:command:create-article')),
    '@acme/blog/create_article_handler',
  );

  t.same(
    curieToHandlerServiceId(SchemaCurie.fromString('acme-widgets:api.v1:request:render-widget')),
    '@acme-widgets/api-v1/render_widget_handler',
  );

  t.end();
});
