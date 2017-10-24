import test from 'tape';
import glob from 'glob';
import fs from 'fs';

import determineEventSources from '../src/aws/lambda/determineEventSource';

test('Event Type Detection Tests', async (t) => {
  await glob('./tests/aws/**/*.json', false, (er, files) => {
    for (const file in files) {
      const contents = fs.readFileSync(files[file]);
      const eventObject = JSON.parse(contents);
      const eventType = determineEventSources(eventObject);
      t.comment(`Found content type: ${JSON.stringify(eventType)}`);
    }
  });
  t.end();
});
