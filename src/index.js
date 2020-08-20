"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sourceMap = require("source-map");
const path = require("path");
const Vinyl = require("vinyl");
const PluginError = require("plugin-error");
const packageJson = require("../package.json");
var through = require('through2');
function default_1(fileName) {
    async function convert(code) {
        let files = [];
        try {
            const value = await new sourceMap.SourceMapConsumer(code);
            value.sources.forEach((source) => {
                let contents = value.sourceContentFor(source, false);
                const filePath = path.join(fileName, source.replace('webpack:///', ''));
                const extname = path.extname(filePath);
                if ([
                    '.vue',
                    '.js',
                    '.cs',
                    '.ts',
                    '.jsx',
                    '.json',
                    '.jpg',
                    '.png',
                ].findIndex((t) => t === extname) > -1) {
                    contents = contents.replace(/(\r\n|\n){2,}[//]{2,}[\s\S.]*/, '');
                    let file = new Vinyl({
                        base: process.cwd(),
                        path: filePath,
                        contents: Buffer.from(contents),
                    });
                    files.push(file);
                }
                else if (extname.indexOf('?') > -1) {
                }
            });
        }
        catch (error) {
            throw new PluginError(packageJson.name, error);
        }
        return files;
    }
    var stream = through.obj(async function (file, encoding, down) {
        if (file.isBuffer()) {
            const before = file.contents.toString(encoding);
            let files = await convert(before);
            for (const item of files) {
                this.push(item);
            }
            return down();
        }
    });
    return stream;
}
exports.default = default_1;
