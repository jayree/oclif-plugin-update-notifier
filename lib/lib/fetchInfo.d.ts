/// <reference types="node" resolution-mode="require"/>
import { SpawnOptions } from 'node:child_process';
import { Plugin } from '@oclif/core/lib/interfaces/index.js';
export type Options = {
    spawnOptions: SpawnOptions;
    defer: boolean;
    pkg: Plugin;
    baseFolder: string;
};
export type PkgUpdate = {
    [distTag: string]: {
        latest: string;
        current: string;
        type: string;
        name: string;
        changeLogUrl: string;
    };
};
export declare function fetchInfo(options: Options): Promise<{
    [pkg: string]: PkgUpdate | string;
}>;
