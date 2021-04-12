"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const options = JSON.parse(process.argv[2]);
const update_notifier_1 = require("update-notifier");
const Debug = require("debug");
const util = require("./checkutils");
const debug = Debug('pluginUpdateNotifier:check');
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    setTimeout(process.exit, 1000 * 60);
    await util.check(new update_notifier_1.UpdateNotifier({ ...options }));
    process.exit();
})().catch((error) => {
    debug(error);
    process.exit(1);
});
//# sourceMappingURL=check.js.map