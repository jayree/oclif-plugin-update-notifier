/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook, Config } from '@oclif/core';
import chalk from 'chalk';
import Debug from 'debug';
import { multiUpdateNotifier, Options } from '../utils/multiUpdateNotifier.js';

type HookOptions = Options & { config: Config } & {
  changeLogUrl?: { [pkg: string]: string };
  ignoreDistTags: string[];
};

export const updateNotifier = async function (this: Hook.Context, options: HookOptions): Promise<void> {
  const debug = Debug(`${this.config.bin}:oclif-plugin-update-notifier:hooks:updatenotifier`);
  if (debug.enabled) options.spawnOptions.stdio = 'inherit';
  const notifier = new multiUpdateNotifier(this.config, {
    updateCheckInterval: options.updateCheckInterval,
    spawnOptions: options.spawnOptions,
    defer: options.defer,
  });
  await notifier.check();
  if (notifier.updates.length > 0) {
    if (options.changeLogUrl) {
      notifier.updates.forEach((update) => {
        if (options.changeLogUrl?.[update.name]) {
          update.changeLogUrl = options.changeLogUrl[update.name];
        }
      });
    }

    if (options.ignoreDistTags)
      notifier.updates = notifier.updates.filter((update) => !options.ignoreDistTags.includes(update.distTag));

    const header = chalk.bold(`${this.config.bin}-plugin update${notifier.updates.length > 1 ? 's' : ''} available!`);
    notifier.notify({ header, defer: options.defer });
  }
};
