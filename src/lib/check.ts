/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const options = JSON.parse(process.argv[2]);

import { UpdateNotifier } from 'update-notifier';
import * as Debug from 'debug';
import * as util from './checkutils';

const debug = Debug('pluginUpdateNotifier:check');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(async () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  setTimeout(process.exit, 1000 * 60);
  await util.check(new UpdateNotifier({ ...options }));
  process.exit();
})().catch((error) => {
  debug(error);
  process.exit(1);
});
