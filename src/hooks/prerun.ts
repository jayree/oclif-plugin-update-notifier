/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/core';
import Debug from 'debug';
import { env } from '@salesforce/kit';

const isOutputEnabled = !process.argv.find((arg) => ['--json', '--help', '-h'].includes(arg));

export const prerun: Hook<'prerun'> = async function (options) {
  const debug = Debug(`${this.config.bin}:oclif-plugin-update-notifier:hooks:prerun`);
  debug({ CommandID: options.Command.id });

  if (env.getBoolean('OCLIF_DISABLE_UPDATENOTIFIER')) {
    debug('found: OCLIF_DISABLE_UPDATENOTIFIER=true');
    return;
  }

  if (!isOutputEnabled) return;

  if (['plugins:install', 'plugins:uninstall'].includes(options.Command.id)) {
    return;
  }

  if (['plugins:update', 'plugins:update:check', 'update'].includes(options.Command.id)) {
    await this.config.runHook('updatenotifier', {
      updateCheckInterval: 0,
      spawnOptions: { detached: false, stdio: 'ignore' },
      defer: false,
    });
  } else {
    await this.config.runHook('updatenotifier', {
      spawnOptions: { detached: true, stdio: 'ignore' },
      defer: true,
    });
  }
};
