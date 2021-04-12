"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotifier = void 0;
const chalk = require("chalk");
const Debug = require("debug");
const cli_ux_1 = require("cli-ux");
const pluginupdatenotifier_1 = require("../lib/pluginupdatenotifier");
const debug = Debug('pluginUpdateNotifier:hook');
const updateNotifier = async function (options) {
    if (!options['spawnOptions'].detached)
        cli_ux_1.cli.action.start('check for updates');
    if (debug.enabled)
        options['spawnOptions'].stdio = 'inherit';
    const notifier = new pluginupdatenotifier_1.pluginUpdateNotifier(this.config.plugins, {
        updateCheckInterval: options['updateCheckInterval'],
        spawnOptions: options['spawnOptions'],
        defer: options['defer'],
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
        if (!options['spawnOptions'].detached)
            cli_ux_1.cli.action.stop();
        notifier.notify({ header, defer: options['defer'] });
    }
};
exports.updateNotifier = updateNotifier;
//# sourceMappingURL=updatenotifier.js.map