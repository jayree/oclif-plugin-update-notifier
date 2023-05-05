/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import process from 'node:process';
import { fetchInfo, Options } from './fetchInfo.js';

// https://github.com/yeoman/update-notifier/blob/3046d0f61a57f8270291b6ab271f8a12df8421a6/check.js#L7
(async (): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  setTimeout(process.exit, 1000 * 30);
  await fetchInfo(JSON.parse(process.argv[2]) as Options);
  process.exit();
})().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});
