import { SpawnOptions } from 'node:child_process';
import { Interfaces } from '@oclif/core';
export type Options = {
    spawnOptions: SpawnOptions;
    defer: boolean;
    pkg: Interfaces.Plugin;
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
