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
        if (un.options.changeLogUrl && un.options.changeLogUrl[un.options.pkg.name]) {
          try {
            const changeLogUrl = un.options.changeLogUrl[un.options.pkg.name];
            await got(changeLogUrl);
            update.changeLogUrl = changeLogUrl;
          } catch {
            update.changeLogUrl = '';
          }
        } else {
          try {
            changeLogBaseUrl = result.versions[update.latest].repository.url
              .replace(/^git\+/, '')
              .replace(/\.git$/, '');
            update.changeLogUrl = await getChangelogURL(changeLogBaseUrl, distTag);
          } catch (error) {
            update.changeLogUrl = changeLogBaseUrl;
            debug({
              options: { ...un.options, distTag },
              error: error.message,
              repository: result.versions[update.latest].repository,
            });
            try {
              const url = new URL(result.versions[update.latest].homepage);
              changeLogBaseUrl = combineURLs(url.origin, url.pathname);
              update.changeLogUrl = await getChangelogURL(changeLogBaseUrl, distTag);
              // eslint-disable-next-line no-shadow
            } catch (error) {
              try {
                const releaseBaseUrl = result.versions[update.latest].repository.url
                  .replace(/^git\+/, '')
                  .replace(/\.git$/, '');
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                const releaseUrl = combineURLs(releaseBaseUrl, `releases/tag/v${update.latest}`);
                await got(releaseUrl);
                update.changeLogUrl = releaseUrl;
                // eslint-disable-next-line no-shadow
              } catch (error) {
                update.changeLogUrl = changeLogBaseUrl;
                debug({
                  options: { ...un.options, distTag },
                  error: error.message,
                  homepage: result.versions[update.latest].homepage,
                });
              }
            }
          }
        }

        un.config.set('update', { ...un.config.get('update'), [distTag]: update });
        un.config.set('lastUpdateCheck', Date.now());
      }
    }
  } catch (error) {
    debug({ error });
  }
}

async function getChangelogURL(changeLogBaseUrl: string, distTag: string): Promise<string> {
  if (changeLogBaseUrl) {
    try {
      const changeLogUrl = combineURLs(changeLogBaseUrl, `/blob/${distTag}/CHANGELOG.md`);
      await got(changeLogUrl);
      return changeLogUrl;
    } catch {
      try {
        const changeLogUrl = combineURLs(changeLogBaseUrl, '/blob/main/CHANGELOG.md');
        await got(changeLogUrl);
        return changeLogUrl;
      } catch {
        try {
          const changeLogUrl = combineURLs(changeLogBaseUrl, '/blob/master/CHANGELOG.md');
          await got(changeLogUrl);
          return changeLogUrl;
        } catch {
          try {
            const changeLogUrl = combineURLs(changeLogBaseUrl, '/CHANGELOG.md');
            await got(changeLogUrl);
            return changeLogUrl;
          } catch {
            throw new Error(`no valid changeLogUrl ${changeLogBaseUrl}`);
          }
        }
      }
    }
  } else {
    throw new Error(`no valid changeLogBaseUrl ${changeLogBaseUrl}`);
  }
}
