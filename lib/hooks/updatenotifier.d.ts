import { Hook, Config } from '@oclif/core';
import { Options } from '../utils/multiUpdateNotifier.js';
type HookOptions = Options & {
    config: Config;
} & {
    changeLogUrl?: {
        [pkg: string]: string;
    };
    ignoreDistTags: string[];
};
export declare const updateNotifier: (this: Hook.Context, options: HookOptions) => Promise<void>;
export {};
