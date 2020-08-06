/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/config';
import * as chalk from 'chalk';
import { multiUpdateNotifier } from '../lib/multiupdatenotifier';
import { extractPjsonFromPlugins } from '../lib/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export const prerun: Hook<'prerun'> = async function (options) {
  const notifier = new multiUpdateNotifier(extractPjsonFromPlugins(this.config.plugins));
  /// const notifier = new multiUpdateNotifier(extractPjsonFromPlugins(this.config.plugins), { updateCheckInterval: 0 });
  if (notifier.fetchInfo()) {
    // do not notify for packages during install/uninstall
    notifier.filter((pkg) => !options.argv.includes(pkg.name));

    const header = chalk.bold(`${this.config.bin}-plugin update${notifier.updates.length > 1 ? 's' : ''} available!`);
    // prettier-ignore
    const footer = `run ${chalk.italic.green(`${this.config.bin} update`)} or ${chalk.italic.green(`${this.config.bin} plugins:update`)} to update!`;

    // for update and plugins:update show the box at the top else at the end of the output
    if (!['update', 'plugins:update'].includes(options.Command.id)) {
      notifier.notify({ header, footer });
    } else {
      notifier.notify({ header, defer: false });
    }
  }
};
