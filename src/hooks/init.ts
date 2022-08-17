/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/core';
import Debug from 'debug';

// eslint-disable-next-line @typescript-eslint/require-await
export const init: Hook<'init'> = async function (options) {
  const debug = Debug(`${this.config.bin}:oclif-plugin-update-notifier:hooks:prerun`);
  debug({ CommandID: options.id });
  if (options.id === 'update' && this.config.platform === 'wsl') {
    debug(`'update' command detected -> replace platform '${this.config.platform}' with 'linux'`);
    this.config.platform = 'linux';
  }
};
