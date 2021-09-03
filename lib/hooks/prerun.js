"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postrun = void 0;
const Debug = require("debug");
const debug = Debug('pluginUpdateNotifier:preRun');
// eslint-disable-next-line @typescript-eslint/require-await
const postrun = async function (options) {
    if (options.Command.id === 'update' && this.config.platform === 'wsl') {
        debug(`'update' command detected -> replace platform '${this.config.platform}' with 'linux'`);
        this.config.platform = 'linux';
    }
};
exports.postrun = postrun;
//# sourceMappingURL=prerun.js.map