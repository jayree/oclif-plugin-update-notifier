/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { URL } from 'url';
import * as Debug from 'debug';
import packageJson from 'package-json';
import * as got from 'got';
import { UpdateNotifier } from 'update-notifier';

const debug = Debug('pluginUpdateNotifier:utils');

export function combineURLs(baseURL: string, relativeURL: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
}

export async function check(un: UpdateNotifier): Promise<void> {
  try {
    const result = await packageJson(un.options.pkg.name, { fullMetadata: true, allVersions: true });
    for await (const distTag of Object.keys(result['dist-tags'])) {
      un.options.distTag = distTag;

      const update = await un.fetchInfo();

      un.config.set('lastUpdateCheck', Date.now());

      if (update.type && update.type !== 'latest') {
        let changeLogBaseUrl;
        try {
          changeLogBaseUrl = result.versions[update.latest].repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
          await got(changeLogBaseUrl);
        } catch (e1) {
          debug({
            options: { ...un.options, distTag },
            error: e1.message,
            repository: result.versions[update.latest].repository,
          });
          try {
            const url = new URL(result.versions[update.latest].homepage);
            changeLogBaseUrl = combineURLs(url.origin, url.pathname);
            await got(changeLogBaseUrl);
          } catch (e2) {
            debug({
              options: { ...un.options, distTag },
              error: e2.message,
              homepage: result.versions[update.latest].homepage,
            });
          }
        }

        if (changeLogBaseUrl) {
          try {
            const changeLogUrl = combineURLs(changeLogBaseUrl, `/blob/${distTag}/CHANGELOG.md`);
            await got(changeLogUrl);
            update.changeLogUrl = changeLogUrl;
          } catch {
            try {
              const changeLogUrl = combineURLs(changeLogBaseUrl, '/blob/main/CHANGELOG.md');
              await got(changeLogUrl);
              update.changeLogUrl = changeLogUrl;
            } catch {
              try {
                const changeLogUrl = combineURLs(changeLogBaseUrl, '/blob/master/CHANGELOG.md');
                await got(changeLogUrl);
                update.changeLogUrl = changeLogUrl;
              } catch {
                update.changeLogUrl = '';
              }
            }
          }
        } else {
          update.changeLogUrl = '';
        }

        un.config.set('update', { ...un.config.get('update'), [distTag]: update });
        un.config.set('lastUpdateCheck', Date.now());
      }
    }
  } catch (error) {
    debug({ error });
  }
}
