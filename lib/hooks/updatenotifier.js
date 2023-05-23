import chalk from 'chalk';
import Debug from 'debug';
import { multiUpdateNotifier } from '../utils/multiUpdateNotifier.js';
export const updateNotifier = async function (options) {
    const debug = Debug(`${this.config.bin}:oclif-plugin-update-notifier:hooks:updatenotifier`);
    if (debug.enabled)
        options.spawnOptions.stdio = 'inherit';
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
//# sourceMappingURL=updatenotifier.js.map