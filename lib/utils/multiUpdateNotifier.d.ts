import { SpawnOptions } from 'node:child_process';
import { Interfaces } from '@oclif/core';
export type Update = {
    name: string;
    current: string;
    latest: string;
    changeLogUrl: string;
    type: string;
    pluginType: string;
    distTag: string;
};
export type Options = {
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
    constructor(config: Interfaces.Config, options: Options);
    check(): Promise<void>;
    notify(options: {
        header: string;
        defer: boolean;
    }): void;
    private getUpdates;
}
