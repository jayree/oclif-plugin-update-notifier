/// <reference types="node" resolution-mode="require"/>
import { SpawnOptions } from 'node:child_process';
import { Config } from '@oclif/core/lib/interfaces/index.js';
export declare type Update = {
    name: string;
    current: string;
    latest: string;
    changeLogUrl: string;
    type: string;
    pluginType: string;
    distTag: string;
};
export declare type Options = {
    spawnOptions: SpawnOptions;
    defer: boolean;
    updateCheckInterval: number;
};
export declare class multiUpdateNotifier {
    updates: Update[];
    private options;
    private config;
    private updateCheckInterval;
    private plugins;
    private debug;
    private baseFolder;
    constructor(config: Config, options: Options);
    check(): Promise<void>;
    notify(options: {
        header: string;
        defer: boolean;
    }): void;
    private getUpdates;
}
