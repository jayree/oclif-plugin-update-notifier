/*
 * Copyright 2026, jayree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
