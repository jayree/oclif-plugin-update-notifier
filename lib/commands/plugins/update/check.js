/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// eslint-disable-next-line sf-plugin/no-oclif-flags-command-import
import { Command } from '@oclif/core';
class PluginsUpdateCheck extends Command {
    // eslint-disable-next-line class-methods-use-this
    async run() {
        // i'm just calling the prerun hook
    }
}
PluginsUpdateCheck.description = 'check installed plugins for updates';
export default PluginsUpdateCheck;
//# sourceMappingURL=check.js.map