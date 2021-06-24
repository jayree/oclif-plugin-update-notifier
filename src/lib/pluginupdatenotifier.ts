/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { spawn } from 'child_process';
import * as Debug from 'debug';
import { UpdateNotifier } from 'update-notifier';
import * as chalk from 'chalk';
import * as boxen from 'boxen';
import { isNpmOrYarn } from 'is-npm';
import * as semver from 'semver';
import { IPlugin } from '@oclif/config';
// import * as Configstore from 'configstore';
import * as util from './checkutils';

const debug = Debug('pluginUpdateNotifier:class');

UpdateNotifier.prototype.check = async function (): Promise<void> {
  if (!this.config || this.config.get('optOut') || this.disabled) {
    return;
  }

  if (Date.now() - this.config.get('lastUpdateCheck') < this.updateCheckInterval) {
    return;
  }

  if (this.options.spawnOptions.detached) {
    spawn(
      process.execPath,
      [path.join(__dirname, 'check.js'), JSON.stringify(this.options)],
      this.options.spawnOptions
    ).unref();
  } else {
    await util.check(this);
  }

  this.update = this.config.get('update');

  if (this.update) {
    Object.keys(this.update).forEach((distTag) => {
      this.update[distTag].current = this.packageVersion;
    });

    this.config.delete('update');
  }
};
export class pluginUpdateNotifier {
  public updates: Array<{
    name: string;
    current: string;
    latest: string;
    changeLogUrl: string;
    type: string;
    pluginType: string;
    distTag: string;
  }> = [];

  // private debug = Debug('pluginUpdateNotifier');
  private options: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private packages: any;
  // private config: Configstore;

  public constructor(plugins: IPlugin[], options: Record<string, unknown> = {}) {
    this.options = options;
    this.packages = plugins.map((p) => {
      return { name: p.name, version: p.version, pluginType: p.type };
    });
    debug({ packages: this.packages });
    // this.config = new Configstore('update-notifier-pluginUpdateNotifier', {
    //   optOut: false,
    //   lastUpdateCheck: Date.now(),
    // });
  }

  public async check(): Promise<void> {
    // if (!this.config || this.config.get('optOut')) {
    //   return;
    // }

    // if (Date.now() - this.config.get('lastUpdateCheck') < this.options.updateCheckInterval) {
    //   debug('updateCheckInterval not reached yet');
    //   return;
    // }

    for (const pkg of this.packages) {
      this.options.pkg = pkg;
      try {
        const notifier = new UpdateNotifier(this.options);
        debug({ check: this.options });
        await notifier.check(this.options.spawnOptions);
        if (notifier.update) {
          Object.keys(notifier.update).forEach((distTag) => {
            if (semver.gt(notifier.update[distTag].latest, notifier.update[distTag].current)) {
              this.updates.push({
                name: pkg.name,
                current: notifier.update[distTag].current,
                latest: notifier.update[distTag].latest,
                changeLogUrl: notifier.update[distTag].changeLogUrl,
                type: notifier.update[distTag].type,
                pluginType: pkg.pluginType,
                distTag,
              });
            }
          });
        }
      } catch (error) {
        debug({ error });
      }
    }

    // this.config.set('lastUpdateCheck', Date.now());

    debug({ checkUpdates: this.updates });
  }

  public filter(callbackfn: (n: Record<string, string>) => boolean): void {
    this.updates.splice(0, this.updates.length, ...this.updates.filter(callbackfn));
  }

  public notify(options: Record<string, unknown> = {}): void {
    this.updates = this.updates.filter((pkg) => pkg.current !== pkg.latest);
    const suppressForNpm = !this.options.shouldNotifyInNpmScript && isNpmOrYarn;

    if (!process.stdout.isTTY || suppressForNpm || this.updates.length === 0) {
      return;
    }

    debug({ notify: this.updates });

    let message = chalk.bold(`Update${this.updates.length > 1 ? 's' : ''} available:\n`);
    if (typeof options.header !== 'undefined') {
      message = `${options.header as string}\n`;
    }
    this.updates.forEach((pkg, index) => {
      // prettier-ignore
      message += `\n${chalk.blueBright(pkg.pluginType === 'core' ? `${pkg.name} (${pkg.pluginType})` : pkg.name)} ${chalk.red(pkg.current)} ${chalk.reset('→')} ${chalk.green(pkg.latest)} ${chalk.dim(`(${pkg.distTag})`)}`;
      if (pkg.changeLogUrl) {
        message += `\n${chalk.cyan(pkg.changeLogUrl)}`;
      }
      if (index !== this.updates.length - 1) {
        message += '\n';
      }
    });

    if (typeof options.footer !== 'undefined') {
      message += `\n\n${options.footer as string}`;
    }

    options.boxenOptions = options.boxenOptions || {
      padding: 1,
      margin: 1,
      align: 'center',
      borderColor: 'yellow',
      borderStyle: 'round',
    };

    message = '\n' + boxen(message, options.boxenOptions);

    if (options.defer === false) {
      console.error(message);
    } else {
      process.on('exit', () => {
        console.error(message);
      });
    }
  }
}
