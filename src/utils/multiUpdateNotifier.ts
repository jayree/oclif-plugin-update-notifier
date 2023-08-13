/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import process from 'node:process';
import { SpawnOptions, spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Interfaces } from '@oclif/core';
import Debug from 'debug';
import chalk from 'chalk';
import boxen from 'boxen';
import semver from 'semver';
import fs from 'fs-extra';
import { fetchInfo, PkgUpdate } from './fetchInfo.js';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

export type Update = {
  name: string;
  current: string;
  latest: string;
  changeLogUrl: string;
  type: string;
  pluginType: string;
  distTag: string;
};

export type Options = {
  spawnOptions: SpawnOptions;
  defer: boolean;
  updateCheckInterval: number;
};

type ConfigStore = {
  optOut: boolean;
  lastUpdateCheck: number;
};

const ONE_DAY = 1000 * 60 * 60 * 24;

export class multiUpdateNotifier {
  public updates: Update[] = [];

  private options: Options;
  private config: ConfigStore;
  private updateCheckInterval: number;
  private plugins: Interfaces.Plugin[];
  private debug: Debug.Debugger;
  private baseFolder: string;

  public constructor(config: Interfaces.Config, options: Options) {
    this.debug = Debug(`${config.bin}:oclif-plugin-update-notifier:updatenotifier`);

    this.options = options;
    this.plugins = config.plugins;
    this.updateCheckInterval = typeof options.updateCheckInterval === 'number' ? options.updateCheckInterval : ONE_DAY;
    this.baseFolder = join(config.cacheDir, `${config.bin}-plugin-update-notifier`);

    if (!fs.pathExistsSync(join(this.baseFolder, 'config.json'))) {
      fs.ensureFileSync(join(this.baseFolder, 'config.json'));
      fs.writeJSONSync(join(this.baseFolder, 'config.json'), {
        optOut: false,
        lastUpdateCheck: Date.now(),
      });
    }
    this.config = fs.readJsonSync(join(this.baseFolder, 'config.json')) as ConfigStore;
  }
  // https://github.com/yeoman/update-notifier/blob/3046d0f61a57f8270291b6ab271f8a12df8421a6/update-notifier.js#L86
  public async check(): Promise<void> {
    if (!this.config || this.config.optOut) {
      return;
    }

    if (this.options.spawnOptions.detached) {
      await this.getUpdates();
    }

    if (Date.now() - this.config.lastUpdateCheck < this.updateCheckInterval) {
      this.debug(
        `updateCheckInterval not reached yet (${
          this.updateCheckInterval - (Date.now() - this.config.lastUpdateCheck)
        })`,
      );
      return;
    }

    const checkPromises = [];
    for await (const pkg of this.plugins) {
      try {
        const options = {
          pkg,
          spawnOptions: this.options.spawnOptions,
          defer: this.options.defer,
          baseFolder: this.baseFolder,
        };

        if (options.spawnOptions.detached) {
          spawn(process.execPath, [join(__dirname, 'check.js'), JSON.stringify(options)], options.spawnOptions).unref();
        } else {
          checkPromises.push(fetchInfo(options));
        }

        this.debug(options);
      } catch (error) {
        this.debug(error as Error);
      }
    }

    if (!this.options.spawnOptions.detached) {
      const result = await Promise.all(checkPromises);
      this.debug({ result });
      await this.getUpdates();
    }
    this.config.lastUpdateCheck = Date.now();
    await fs.writeJson(join(this.baseFolder, 'config.json'), this.config);
  }

  // https://github.com/yeoman/update-notifier/blob/3046d0f61a57f8270291b6ab271f8a12df8421a6/update-notifier.js#L129
  public notify(options: { header: string; defer: boolean }): void {
    if (!process.stdout.isTTY || this.updates.length === 0) {
      return;
    }

    let message = `${options.header}\n`;

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

    message = `\n${boxen(message, {
      padding: 1,
      margin: 1,
      align: 'center',
      borderColor: 'yellow',
      borderStyle: 'round',
    })}`;

    if (options.defer === false) {
      // eslint-disable-next-line no-console
      console.error(message);
    } else {
      process.on('exit', () => {
        // eslint-disable-next-line no-console
        console.error(message);
      });
    }
  }

  private async getUpdates(): Promise<void> {
    for await (const pkg of this.plugins) {
      if (await fs.pathExists(join(this.baseFolder, `${pkg.name}.json`))) {
        const config = (await fs.readJson(join(this.baseFolder, `${pkg.name}.json`))) as { update: PkgUpdate };

        if (config.update) {
          Object.keys(config.update).forEach((distTag) => {
            if (semver.gt(config.update[distTag].latest, config.update[distTag].current)) {
              const update = {
                ...config.update[distTag],
                name: pkg.name,
                current: pkg.version,
                pluginType: pkg.type,
                distTag,
              };
              this.updates.push(update);
              this.debug(update);
            }
          });
          await fs.remove(join(this.baseFolder, `${pkg.name}.json`));
        }
      }
    }
  }
}
