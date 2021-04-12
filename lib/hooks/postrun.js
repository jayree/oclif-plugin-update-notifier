"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postrun = void 0;
const kit_1 = require("@salesforce/kit");
const Debug = require("debug");
const debug = Debug('pluginUpdateNotifier:postRun');
const postrun = async function () {
    if (kit_1.env.getBoolean('OCLIF_DISABLE_UPDATENOTIFIER')) {
        debug('found: OCLIF_DISABLE_UPDATENOTIFIER=true');
        return;
    }
    await this.config.runHook('updateNotifier', {
        updateCheckInterval: 1000 * 60 * 60 * 24,
        spawnOptions: { detached: true, stdio: 'ignore' },
        defer: true,
    });
};
exports.postrun = postrun;
//# sourceMappingURL=postrun.js.map