/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/config';
import { env } from '@salesforce/kit';
import * as Debug from 'debug';

const debug = Debug('pluginUpdateNotifier:postRun');

export const postrun: Hook<'postrun'> = async function (options) {
  if (!['plugins:install', 'plugins:uninstall'].includes(options.Command.id)) {
    if (env.getBoolean('OCLIF_DISABLE_UPDATENOTIFIER')) {
      debug('found: OCLIF_DISABLE_UPDATENOTIFIER=true');
      return;
    }
    await this.config.runHook('updateNotifier', {
      updateCheckInterval: 1000 * 60 * 60 * 24,
      spawnOptions: { detached: true, stdio: 'ignore' },
      defer: true,
    });
  }
};
