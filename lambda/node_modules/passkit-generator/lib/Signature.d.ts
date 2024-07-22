/// <reference types="node" />
import type * as Schemas from "./schemas";
import { Buffer } from "buffer";
/**
 * Creates an hash for a buffer. Used by manifest
 *
 * @param buffer
 * @returns
 */
export declare function createHash(buffer: Buffer): string;
/**
 * Generates the PKCS #7 cryptografic signature for the manifest file.
 *
 * @method create
 * @params manifest
 * @params certificates
 * @returns
 */
export declare function create(manifestBuffer: Buffer, certificates: Schemas.CertificatesSchema): Buffer;
