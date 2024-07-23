/// <reference types="node" />
import { Buffer } from "buffer";
import Joi from "joi";
export interface CertificatesSchema {
    wwdr: string | Buffer;
    signerCert: string | Buffer;
    signerKey: string | Buffer;
    signerKeyPassphrase?: string;
}
export declare const CertificatesSchema: Joi.ObjectSchema<CertificatesSchema>;
