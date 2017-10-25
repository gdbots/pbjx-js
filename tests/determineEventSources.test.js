import test from 'tape';
import glob from 'glob';
import fs from 'fs';
import path from 'path';

import determineEventSources from '../src/aws/lambda/determineEventSource';

test('Event Type Detection Tests', async (t) => {
  glob('./tests/aws/**/*.json', false, (er, files) => {
    for (const file in files) {
      const contents = fs.readFileSync(files[file]);
      const eventObject = JSON.parse(contents);
      const eventType = determineEventSources(eventObject);
      let eventTypeExpected = path.basename(files[file]);
      eventTypeExpected = eventTypeExpected.toUpperCase()
                          .replace('.JSON', '')
                          .replace('-', '_');
      t.comment(`Found content type: ${eventType}, for file ${path.basename(files[file])}`);
      t.equal(eventType, eventTypeExpected);
    }
  });
  t.end();
});
