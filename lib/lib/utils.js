"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPjsonFromPlugins = void 0;
function extractPjsonFromPlugins(plugins) {
    return plugins
        // filter all core plugins and child plugins (plugins with a parent)
        // .filter((p) => p.type !== 'core')
        .filter((p) => typeof p.parent === 'undefined')
        .map((p) => p.pjson);
}
exports.extractPjsonFromPlugins = extractPjsonFromPlugins;
//# sourceMappingURL=utils.js.map