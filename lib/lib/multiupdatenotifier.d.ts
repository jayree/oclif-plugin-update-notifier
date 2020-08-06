export interface ReducedPackageJson {
    name: string;
    version: string;
    repository: string;
}
export declare class multiUpdateNotifier {
    updates: Array<{
        name: string;
        current: string;
        latest: string;
        changeLogUrl: string;
    }>;
    private packages;
    private debug;
    private options;
    constructor(packages: ReducedPackageJson[], options?: Record<string, unknown>);
    storeChangeLogUrl(): void;
    filter(callbackfn: (n: Record<string, string>) => boolean): void;
    fetchInfo(): boolean;
    notify(options?: Record<string, unknown>): void;
}
