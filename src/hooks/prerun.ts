/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/config';
import * as Debug from 'debug';

const debug = Debug('pluginUpdateNotifier:preRun');

// eslint-disable-next-line @typescript-eslint/require-await
export const postrun: Hook<'postrun'> = async function (options) {
  if (options.Command.id === 'update' && this.config.platform === 'wsl') {
    debug(`'update' command detected -> replace platform '${this.config.platform}' with 'linux'`);
    this.config.platform = 'linux';
  }
};
