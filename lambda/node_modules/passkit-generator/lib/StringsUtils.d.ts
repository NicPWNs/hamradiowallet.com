/// <reference types="node" />
import { Buffer } from "buffer";
/**
 * Parses a string file to convert it to
 * an object
 *
 * @param buffer
 * @returns
 */
export declare function parse(buffer: Buffer): {
    translations: [placeholder: string, value: string][];
    comments: string[];
};
/**
 * Creates a strings file buffer
 *
 * @param translations
 * @returns
 */
export declare function create(translations: {
    [key: string]: string;
}): Buffer;
