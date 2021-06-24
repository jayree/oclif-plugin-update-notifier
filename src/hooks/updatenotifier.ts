/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/config';
import * as chalk from 'chalk';
import * as Debug from 'debug';
import { cli } from 'cli-ux';
import { pluginUpdateNotifier } from '../lib/pluginupdatenotifier';

const debug = Debug('pluginUpdateNotifier:hook');

export const updateNotifier: Hook<'updateNotifier'> = async function (options) {
  if (!options['spawnOptions'].detached) cli.action.start('check for updates');
  if (debug.enabled) options['spawnOptions'].stdio = 'inherit';
  const notifier = new pluginUpdateNotifier(this.config.plugins, {
    updateCheckInterval: options['updateCheckInterval'],
    spawnOptions: options['spawnOptions'],
    defer: options['defer'],
    changeLogUrl: options['changeLogUrl'],
  });
  await notifier.check();
  if (notifier.updates.length > 0) {
    notifier.updates.forEach((update) => {
      if (options['changeLogUrl'] && options['changeLogUrl'][update.name]) {
        update.changeLogUrl = options['changeLogUrl'][update.name];
      }
    });

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const header = chalk.bold(`${this.config.bin}-plugin update${notifier.updates.length > 1 ? 's' : ''} available!`);
    if (!options['spawnOptions'].detached) cli.action.stop();
    notifier.notify({ header, defer: options['defer'] });
  }
};
