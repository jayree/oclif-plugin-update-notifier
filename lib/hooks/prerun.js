"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prerun = void 0;
const chalk = require("chalk");
const multiupdatenotifier_1 = require("../lib/multiupdatenotifier");
const utils_1 = require("../lib/utils");
// eslint-disable-next-line @typescript-eslint/require-await
const prerun = async function (options) {
    const notifier = new multiupdatenotifier_1.multiUpdateNotifier(utils_1.extractPjsonFromPlugins(this.config.plugins));
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
        }
        else {
            notifier.notify({ header, defer: false });
        }
    }
};
exports.prerun = prerun;
//# sourceMappingURL=prerun.js.map