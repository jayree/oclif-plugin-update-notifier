import Debug from 'debug';
// eslint-disable-next-line @typescript-eslint/require-await
export const init = async function (options) {
    const debug = Debug(`${this.config.bin}:oclif-plugin-update-notifier:hooks:prerun`);
    debug({ CommandID: options.id });
    if (options.id === 'update' && this.config.platform === 'wsl') {
        debug(`'update' command detected -> replace platform '${this.config.platform}' with 'linux'`);
        this.config.platform = 'linux';
    }
};
//# sourceMappingURL=init.js.map