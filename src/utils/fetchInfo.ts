/*
 * Copyright 2025, jayree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SpawnOptions } from 'node:child_process';
import path from 'node:path';
import got from 'got';
import semver from 'semver';
import packageJson from 'package-json';
import { Interfaces } from '@oclif/core';
import fs from 'fs-extra';

export type Options = {
  spawnOptions: SpawnOptions;
  defer: boolean;
  pkg: Interfaces.Plugin;
  baseFolder: string;
};

export type PkgUpdate = {
  [distTag: string]: { latest: string; current: string; type: string; name: string; changeLogUrl: string };
};

const combineURLs = (baseURL: string, relativeURL: string): string =>
  baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');

async function getChangelogURL(plugin: Interfaces.Plugin, latest: string): Promise<string> {
  const pJson = plugin.pjson as unknown as {
    oclif: { info: { releasenotes: { releaseNotesPath: string; releaseNotesFilename: string } } };
    repository: string;
    homepage: string;
  };

  let changeLogUrl: string;

  if (pJson.oclif?.info?.releasenotes?.releaseNotesPath && pJson.oclif?.info?.releasenotes?.releaseNotesFilename) {
    changeLogUrl = `${pJson.oclif?.info?.releasenotes?.releaseNotesPath}/${pJson.oclif?.info?.releasenotes?.releaseNotesFilename}`;
  } else {
    let changeLogBaseUrl = '';
    try {
      changeLogBaseUrl = `https://github.com/${pJson.repository}`;
      await got.head(changeLogBaseUrl);
    } catch (error) {
      try {
        const homepage = new URL(pJson.homepage);
        changeLogBaseUrl = combineURLs(homepage.origin, homepage.pathname);
        await got.head(changeLogBaseUrl);
      } catch (err) {
        changeLogUrl = '';
      }
    }
    try {
      const releaseUrl = combineURLs(changeLogBaseUrl, `releases/tag/v${latest}`);
      await got.head(releaseUrl);
      changeLogUrl = releaseUrl;
    } catch (err) {
      try {
        const releaseUrl = combineURLs(changeLogBaseUrl, `releases/tag/${latest}`);
        await got.head(releaseUrl);
        changeLogUrl = releaseUrl;
      } catch (e) {
        changeLogUrl = '';
      }
    }
  }
  return changeLogUrl;
}

// https://github.com/yeoman/update-notifier/blob/3046d0f61a57f8270291b6ab271f8a12df8421a6/update-notifier.js#L117
export async function fetchInfo(options: Options): Promise<{ [pkg: string]: PkgUpdate | string }> {
  try {
    const pkgJson = await packageJson(options.pkg.name, { allVersions: true });
    const update: PkgUpdate = {};
    for await (const distTag of Object.keys(pkgJson['dist-tags'])) {
      const latest = pkgJson['dist-tags'][distTag];
      const type = semver.diff(options.pkg.version, latest) as string;
      let changeLogUrl: string;

      if (type && type !== 'latest') {
        changeLogUrl = await getChangelogURL(options.pkg, latest);
        update[distTag] = { latest, current: options.pkg.version, type, name: options.pkg.name, changeLogUrl };
      }
    }
    if (Object.keys(update).length) {
      await fs.ensureFile(path.join(options.baseFolder, `${options.pkg.name}.json`));
      await fs.writeJson(path.join(options.baseFolder, `${options.pkg.name}.json`), { update });
    }
    return { [options.pkg.name]: update };
  } catch (error) {
    return { [options.pkg.name]: (error as Error).message };
  }
}
