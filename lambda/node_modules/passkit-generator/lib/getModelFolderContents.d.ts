/// <reference types="node" />
import type { Buffer } from "buffer";
/**
 * Reads the model folder contents
 *
 * @param model
 * @returns A promise of an object containing all
 * 		filePaths and the relative buffer
 */
export default function getModelFolderContents(model: string): Promise<{
    [filePath: string]: Buffer;
}>;
