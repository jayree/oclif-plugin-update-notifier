/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as Debug from 'debug';
import * as UpdateNotifier from 'update-notifier';
import * as chalk from 'chalk';
import * as boxen from 'boxen';
import * as ConfigStore from 'configstore';
import * as gh from 'github-url-to-object';
import * as request from 'request';
import { isNpmOrYarn } from 'is-npm';

export interface ReducedPackageJson {
  name: string;
  version: string;
  repository: string;
}

export class multiUpdateNotifier {
  public updates: Array<{ name: string; current: string; latest: string; changeLogUrl: string }> = [];

  private packages: ReducedPackageJson[] = [];
  private debug = Debug('multiUpdateNotifier');
  private options: Record<string, unknown>;

  public constructor(packages: ReducedPackageJson[], options: Record<string, unknown> = {}) {
    this.options = options;
    this.packages = packages.map((p) => {
      return {
        name: p.name,
        version: p.version,
        repository: p.repository,
      };
    });
    this.debug({ scope: this.packages.map((p) => p.name) });
  }

  public storeChangeLogUrl(): void {
    for (const pkg of this.packages) {
      try {
        const config = new ConfigStore(`update-notifier-${pkg.name}`);
        const storedChangeLogUrl = config.get('changeLogUrl');
        if (typeof storedChangeLogUrl === 'undefined') {
          let changeLogUrl = gh(pkg.repository);
          if (changeLogUrl !== null) {
            changeLogUrl = changeLogUrl.https_url;
            changeLogUrl += '/blob/master/CHANGELOG.md';
            request({ method: 'HEAD', uri: changeLogUrl }, function (error, response) {
              if (!error && response.statusCode === 200) {
                this.debug({ set: { name: pkg.name, changeLogUrl, repository: pkg.repository } });
                config.set('changeLogUrl', changeLogUrl);
              } else {
                // prettier-ignore
                this.debug({ request: { name: pkg.name, url: changeLogUrl, statusCode: response.statusCode, repository: pkg.repository } });
              }
            });
          } else {
            this.debug({ name: pkg.name, repository: pkg.repository });
          }
        } else {
          this.debug({ get: { name: pkg.name, changeLogUrl: storedChangeLogUrl, repository: pkg.repository } });
        }
      } catch (_) {
        this.debug(_);
      }
    }
  }

  public filter(callbackfn: (n: Record<string, string>) => boolean): void {
    this.updates.splice(0, this.updates.length, ...this.updates.filter(callbackfn));
  }

  public fetchInfo(): boolean {
    for (const pkg of this.packages) {
      this.options.pkg = pkg;
      // this.options.updateCheckInterval = 0;
      const notifier = UpdateNotifier(this.options);
      if (notifier.update) {
        this.updates.push({
          name: pkg.name,
          current: notifier.update.current,
          latest: notifier.update.latest,
          changeLogUrl: notifier.config.get('changeLogUrl'),
        });
      }
    }

    this.debug({ checkUpdates: this.updates });
    if (this.updates.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  public notify(options: Record<string, unknown> = {}): void {
    this.updates = this.updates.filter((pkg) => pkg.current !== pkg.latest);
    const suppressForNpm = !this.options.shouldNotifyInNpmScript && isNpmOrYarn;

    if (!process.stdout.isTTY || suppressForNpm || this.updates.length === 0) {
      return;
    }

    this.debug({ notify: this.updates });

    let message = chalk.bold(`Update${this.updates.length > 1 ? 's' : ''} available:\n`);
    if (typeof options.header !== 'undefined') {
      message = `${options.header as string}\n`;
    }
    this.updates.forEach((pkg, index) => {
      // prettier-ignore
      message += `\n${chalk.blueBright(pkg.name)} ${chalk.red(pkg.current)} ${chalk.reset('→')} ${chalk.green(pkg.latest)}`;
      if (typeof pkg.changeLogUrl !== 'undefined') {
        message += `\n${chalk.yellow('Changelog: ')}${chalk.cyan(pkg.changeLogUrl)}`;
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
      borderStyle: boxen.BorderStyle.Round,
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
