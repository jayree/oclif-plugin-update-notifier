/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'node:path';
import got from 'got';
import semverDiff from 'semver-diff';
import { CliUx } from '@oclif/core';
import packageJson from 'package-json';
import fs from 'fs-extra';
const combineURLs = (baseURL, relativeURL) => baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
async function validateChangelogURL(changeLogBaseUrl, distTag) {
    if (changeLogBaseUrl) {
        try {
            const changeLogUrl = combineURLs(changeLogBaseUrl, `/blob/${distTag}/CHANGELOG.md`);
            await got.head(changeLogUrl);
            return changeLogUrl;
        }
        catch {
            try {
                const changeLogUrl = combineURLs(changeLogBaseUrl, '/blob/main/CHANGELOG.md');
                await got.head(changeLogUrl);
                return changeLogUrl;
            }
            catch {
                try {
                    const changeLogUrl = combineURLs(changeLogBaseUrl, '/blob/master/CHANGELOG.md');
                    await got.head(changeLogUrl);
                    await got.head(changeLogBaseUrl);
                    return changeLogUrl;
                }
                catch {
                    try {
                        const changeLogUrl = combineURLs(changeLogBaseUrl, '/CHANGELOG.md');
                        await got.head(changeLogUrl);
                        return changeLogUrl;
                    }
                    catch {
                        throw new Error(`no valid changeLogUrl ${changeLogBaseUrl}`);
                    }
                }
            }
        }
    }
    else {
        throw new Error(`no valid changeLogBaseUrl ${changeLogBaseUrl}`);
    }
}
async function getChangelogURL(plugin, latest, distTag) {
    const pJson = plugin.pjson;
    let changeLogUrl;
    if (pJson.oclif?.info?.releasenotes?.releaseNotesPath && pJson.oclif?.info?.releasenotes?.releaseNotesFilename) {
        changeLogUrl = `${pJson.oclif?.info?.releasenotes?.releaseNotesPath}/${pJson.oclif?.info?.releasenotes?.releaseNotesFilename}`;
    }
    else {
        let changeLogBaseUrl;
        try {
            changeLogBaseUrl = `https://github.com/${pJson.repository}`;
            await got.head(changeLogBaseUrl);
        }
        catch (error) {
            try {
                const homepage = new URL(pJson.homepage);
                changeLogBaseUrl = combineURLs(homepage.origin, homepage.pathname);
                await got.head(changeLogBaseUrl);
            }
            catch (err) {
                changeLogUrl = '';
            }
        }
        try {
            changeLogUrl = await validateChangelogURL(changeLogBaseUrl, distTag);
        }
        catch (error) {
            try {
                const releaseUrl = combineURLs(changeLogBaseUrl, `releases/tag/v${latest}`);
                await got.head(releaseUrl);
                changeLogUrl = releaseUrl;
            }
            catch (err) {
                try {
                    const releaseUrl = combineURLs(changeLogBaseUrl, `releases/tag/${latest}`);
                    await got.head(releaseUrl);
                    changeLogUrl = releaseUrl;
                }
                catch (e) {
                    changeLogUrl = '';
                }
            }
        }
    }
    return changeLogUrl;
}
// https://github.com/yeoman/update-notifier/blob/3046d0f61a57f8270291b6ab271f8a12df8421a6/update-notifier.js#L117
export async function fetchInfo(options) {
    try {
        const pkgJson = await packageJson(options.pkg.name, { allVersions: true });
        const update = {};
        for await (const distTag of Object.keys(pkgJson['dist-tags'])) {
            const latest = pkgJson['dist-tags'][distTag];
            const type = semverDiff(options.pkg.version, latest);
            let changeLogUrl;
            if (type && type !== 'latest') {
                changeLogUrl = await getChangelogURL(options.pkg, latest, distTag);
                update[distTag] = { latest, current: options.pkg.version, type, name: options.pkg.name, changeLogUrl };
            }
        }
        if (Object.keys(update).length) {
            await fs.ensureFile(path.join(options.baseFolder, `${options.pkg.name}.json`));
            await fs.writeJson(path.join(options.baseFolder, `${options.pkg.name}.json`), { update });
        }
    }
    catch (error) {
        CliUx.ux.warn(error.message);
    }
}
//# sourceMappingURL=fetchInfo.js.map