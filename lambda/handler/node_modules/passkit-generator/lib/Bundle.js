"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.mimeTypeSymbol = exports.freezeSymbol = exports.filesSymbol = void 0;
const tslib_1 = require("tslib");
const stream_1 = require("stream");
const Messages = tslib_1.__importStar(require("./messages"));
const zip = tslib_1.__importStar(require("do-not-zip"));
exports.filesSymbol = Symbol("bundleFiles");
exports.freezeSymbol = Symbol("bundleFreeze");
exports.mimeTypeSymbol = Symbol("bundleMimeType");
/**
 * Defines a container ready to be distributed.
 * If no mimeType is passed to the constructor,
 * it will throw an error.
 */
class Bundle {
    constructor(mimeType) {
        this[_a] = {};
        if (!mimeType) {
            throw new Error(Messages.BUNDLE.MIME_TYPE_MISSING);
        }
        this[exports.mimeTypeSymbol] = mimeType;
    }
    /**
     * Creates a bundle and exposes the
     * function to freeze it manually once
     * completed.
     *
     * This was made to not expose freeze
     * function outside of Bundle class.
     *
     * Normally, a bundle would get freezed
     * when using getAsBuffer or getAsStream
     * but when creating a PKPasses archive,
     * we need to freeze the bundle so the
     * user cannot add more files (we want to
     * allow them to only the selected files)
     * but also letting them choose how to
     * export it.
     *
     * @param mimeType
     * @returns
     */
    static freezable(mimeType) {
        const bundle = new Bundle(mimeType);
        return [bundle, () => bundle[exports.freezeSymbol]()];
    }
    /**
     * Retrieves bundle's mimeType
     */
    get mimeType() {
        return this[exports.mimeTypeSymbol];
    }
    /**
     * Freezes the bundle so no more files
     * can be added any further.
     */
    [(_a = exports.filesSymbol, exports.freezeSymbol)]() {
        if (this.isFrozen) {
            return;
        }
        Object.freeze(this[exports.filesSymbol]);
    }
    /**
     * Tells if this bundle still allows files to be added.
     * @returns false if files are allowed, true otherwise
     */
    get isFrozen() {
        return Object.isFrozen(this[exports.filesSymbol]);
    }
    /**
     * Returns a copy of the current list of buffers
     * that have been added to the class.
     *
     * It does not include translation files, manifest
     * and signature.
     *
     * Final files list might differ due to export
     * conditions.
     */
    get files() {
        return Object.keys(this[exports.filesSymbol]);
    }
    /**
     * Allows files to be added to the bundle.
     * If the bundle is closed, it will throw an error.
     *
     * @param fileName
     * @param buffer
     */
    addBuffer(fileName, buffer) {
        if (this.isFrozen) {
            throw new Error(Messages.BUNDLE.CLOSED);
        }
        this[exports.filesSymbol][fileName] = buffer;
    }
    /**
     * Closes the bundle and returns it as a Buffer.
     * Once closed, the bundle does not allow files
     * to be added any further.
     *
     * @returns Buffer
     */
    getAsBuffer() {
        this[exports.freezeSymbol]();
        return zip.toBuffer(createZipFilesMap(this[exports.filesSymbol]));
    }
    /**
     * Closes the bundle and returns it as a stream.
     * Once closed, the bundle does not allow files
     * to be added any further.
     *
     * @returns
     */
    getAsStream() {
        this[exports.freezeSymbol]();
        return stream_1.Readable.from(zip.toBuffer(createZipFilesMap(this[exports.filesSymbol])));
    }
    /**
     * Closes the bundle and returns it as an object.
     * This allows developers to choose a different way
     * of serving, analyzing or zipping the file, outside the
     * default compression system.
     *
     * @returns a frozen object containing files paths as key
     * 		and Buffers as content.
     */
    getAsRaw() {
        this[exports.freezeSymbol]();
        return Object.freeze({ ...this[exports.filesSymbol] });
    }
}
exports.default = Bundle;
/**
 * Creates a files map for do-not-zip
 *
 * @param files
 * @returns
 */
function createZipFilesMap(files) {
    return Object.entries(files).map(([path, data]) => ({
        path,
        data,
    }));
}
//# sourceMappingURL=Bundle.js.map