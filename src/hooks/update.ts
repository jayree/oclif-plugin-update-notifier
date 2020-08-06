/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/config';
import { multiUpdateNotifier } from '../lib/multiupdatenotifier';
import { extractPjsonFromPlugins } from '../lib/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export const update: Hook<'update'> = async function () {
  const notifier = new multiUpdateNotifier(extractPjsonFromPlugins(this.config.plugins));
  notifier.storeChangeLogUrl();
};
