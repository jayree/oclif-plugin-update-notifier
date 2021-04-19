"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginUpdateNotifier = void 0;
/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const path = require("path");
const child_process_1 = require("child_process");
const Debug = require("debug");
const update_notifier_1 = require("update-notifier");
const chalk = require("chalk");
const boxen = require("boxen");
const is_npm_1 = require("is-npm");
const semver = require("semver");
// import * as Configstore from 'configstore';
const util = require("./checkutils");
const debug = Debug('pluginUpdateNotifier:class');
update_notifier_1.UpdateNotifier.prototype.check = async function () {
    if (!this.config || this.config.get('optOut') || this.disabled) {
        return;
    }
    if (Date.now() - this.config.get('lastUpdateCheck') < this.updateCheckInterval) {
        return;
    }
    if (this.options.spawnOptions.detached) {
        child_process_1.spawn(process.execPath, [path.join(__dirname, 'check.js'), JSON.stringify(this.options)], this.options.spawnOptions).unref();
    }
    else {
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
class pluginUpdateNotifier {
    // private config: Configstore;
    constructor(plugins, options = {}) {
        this.updates = [];
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
    async check() {
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
                const notifier = new update_notifier_1.UpdateNotifier(this.options);
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
            }
            catch (error) {
                debug({ error });
            }
        }
        // this.config.set('lastUpdateCheck', Date.now());
        debug({ checkUpdates: this.updates });
    }
    filter(callbackfn) {
        this.updates.splice(0, this.updates.length, ...this.updates.filter(callbackfn));
    }
    notify(options = {}) {
        this.updates = this.updates.filter((pkg) => pkg.current !== pkg.latest);
        const suppressForNpm = !this.options.shouldNotifyInNpmScript && is_npm_1.isNpmOrYarn;
        if (!process.stdout.isTTY || suppressForNpm || this.updates.length === 0) {
            return;
        }
        debug({ notify: this.updates });
        let message = chalk.bold(`Update${this.updates.length > 1 ? 's' : ''} available:\n`);
        if (typeof options.header !== 'undefined') {
            message = `${options.header}\n`;
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
            message += `\n\n${options.footer}`;
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
        }
        else {
            process.on('exit', () => {
                console.error(message);
            });
        }
    }
}
exports.pluginUpdateNotifier = pluginUpdateNotifier;
//# sourceMappingURL=pluginupdatenotifier.js.map