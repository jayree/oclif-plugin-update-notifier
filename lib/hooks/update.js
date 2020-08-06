"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const multiupdatenotifier_1 = require("../lib/multiupdatenotifier");
const utils_1 = require("../lib/utils");
// eslint-disable-next-line @typescript-eslint/require-await
exports.update = async function () {
    const notifier = new multiupdatenotifier_1.multiUpdateNotifier(utils_1.extractPjsonFromPlugins(this.config.plugins));
    notifier.storeChangeLogUrl();
};
//# sourceMappingURL=update.js.map