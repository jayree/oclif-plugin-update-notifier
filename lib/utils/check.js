/*
 * Copyright 2026, jayree
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
import process from 'node:process';
import { fetchInfo } from './fetchInfo.js';
// https://github.com/yeoman/update-notifier/blob/3046d0f61a57f8270291b6ab271f8a12df8421a6/check.js#L7
(async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    setTimeout(process.exit, 1000 * 30);
    await fetchInfo(JSON.parse(process.argv[2]));
    process.exit();
})().catch((error) => {
    if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error(error.message);
    }
    process.exit(1);
});
//# sourceMappingURL=check.js.map