/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { IPlugin } from '@oclif/config';

export function extractPjsonFromPlugins(plugins: IPlugin[]): [] {
  return (
    plugins
      // filter all core plugins and child plugins (plugins with a parent)
      .filter((p) => p.type !== 'core')
      .filter((p) => typeof ((p as unknown) as Record<string, unknown>).parent === 'undefined')
      .map((p) => p.pjson) as []
  );
}
