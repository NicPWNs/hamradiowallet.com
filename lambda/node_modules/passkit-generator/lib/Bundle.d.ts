/// <reference types="node" />
/// <reference types="node" />
import { Stream } from "stream";
export declare const filesSymbol: unique symbol;
export declare const freezeSymbol: unique symbol;
export declare const mimeTypeSymbol: unique symbol;
declare namespace Mime {
    type type = string;
    type subtype = string;
}
/**
 * Defines a container ready to be distributed.
 * If no mimeType is passed to the constructor,
 * it will throw an error.
 */
export default class Bundle {
    private [filesSymbol];
    private [mimeTypeSymbol];
    constructor(mimeType: `${Mime.type}/${Mime.subtype}`);
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
    static freezable(mimeType: `${Mime.type}/${Mime.subtype}`): [Bundle, Function];
    /**
     * Retrieves bundle's mimeType
     */
    get mimeType(): string;
    /**
     * Freezes the bundle so no more files
     * can be added any further.
     */
    private [freezeSymbol];
    /**
     * Tells if this bundle still allows files to be added.
     * @returns false if files are allowed, true otherwise
     */
    get isFrozen(): boolean;
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
    get files(): string[];
    /**
     * Allows files to be added to the bundle.
     * If the bundle is closed, it will throw an error.
     *
     * @param fileName
     * @param buffer
     */
    addBuffer(fileName: string, buffer: Buffer): void;
    /**
     * Closes the bundle and returns it as a Buffer.
     * Once closed, the bundle does not allow files
     * to be added any further.
     *
     * @returns Buffer
     */
    getAsBuffer(): Buffer;
    /**
     * Closes the bundle and returns it as a stream.
     * Once closed, the bundle does not allow files
     * to be added any further.
     *
     * @returns
     */
    getAsStream(): Stream;
    /**
     * Closes the bundle and returns it as an object.
     * This allows developers to choose a different way
     * of serving, analyzing or zipping the file, outside the
     * default compression system.
     *
     * @returns a frozen object containing files paths as key
     * 		and Buffers as content.
     */
    getAsRaw(): {
        [filePath: string]: Buffer;
    };
}
export {};
