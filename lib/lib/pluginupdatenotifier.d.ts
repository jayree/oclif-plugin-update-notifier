import { IPlugin } from '@oclif/config';
export declare class pluginUpdateNotifier {
    updates: Array<{
        name: string;
        current: string;
        latest: string;
        changeLogUrl: string;
        type: string;
        pluginType: string;
        distTag: string;
    }>;
    private options;
    private packages;
    constructor(plugins: IPlugin[], options?: Record<string, unknown>);
    check(): Promise<void>;
    filter(callbackfn: (n: Record<string, string>) => boolean): void;
    notify(options?: Record<string, unknown>): void;
}
