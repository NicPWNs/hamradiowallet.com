/// <reference types="node" />
export * from "./Barcode";
export * from "./Beacon";
export * from "./Location";
export * from "./Field";
export * from "./NFC";
export * from "./Semantics";
export * from "./PassFields";
export * from "./Personalize";
export * from "./Certificates";
import Joi from "joi";
import { Buffer } from "buffer";
import { Barcode } from "./Barcode";
import { Location } from "./Location";
import { Beacon } from "./Beacon";
import { NFC } from "./NFC";
import { PassFields, TransitType } from "./PassFields";
import { Semantics } from "./Semantics";
import { CertificatesSchema } from "./Certificates";
export interface FileBuffers {
    [key: string]: Buffer;
}
export interface PassProps {
    formatVersion?: 1;
    serialNumber?: string;
    description?: string;
    organizationName?: string;
    passTypeIdentifier?: string;
    teamIdentifier?: string;
    appLaunchURL?: string;
    voided?: boolean;
    userInfo?: {
        [key: string]: any;
    };
    sharingProhibited?: boolean;
    groupingIdentifier?: string;
    suppressStripShine?: boolean;
    logoText?: string;
    maxDistance?: number;
    semantics?: Semantics;
    webServiceURL?: string;
    associatedStoreIdentifiers?: Array<number>;
    authenticationToken?: string;
    backgroundColor?: string;
    foregroundColor?: string;
    labelColor?: string;
    nfc?: NFC;
    beacons?: Beacon[];
    barcodes?: Barcode[];
    relevantDate?: string;
    expirationDate?: string;
    locations?: Location[];
    boardingPass?: PassFields & {
        transitType: TransitType;
    };
    eventTicket?: PassFields;
    coupon?: PassFields;
    generic?: PassFields;
    storeCard?: PassFields;
}
/**
 * These are the properties passkit-generator will
 * handle through its methods
 */
type PassMethodsProps = "nfc" | "beacons" | "barcodes" | "relevantDate" | "expirationDate" | "locations";
export type PassTypesProps = "boardingPass" | "eventTicket" | "coupon" | "generic" | "storeCard";
export type OverridablePassProps = Omit<PassProps, PassMethodsProps | PassTypesProps>;
export type PassPropsFromMethods = {
    [K in PassMethodsProps]: PassProps[K];
};
export type PassKindsProps = {
    [K in PassTypesProps]: PassProps[K];
};
export type PassColors = Pick<OverridablePassProps, "backgroundColor" | "foregroundColor" | "labelColor">;
export declare const PassPropsFromMethods: Joi.ObjectSchema<PassPropsFromMethods>;
export declare const PassKindsProps: Joi.ObjectSchema<PassKindsProps>;
export declare const PassType: Joi.StringSchema;
export declare const OverridablePassProps: Joi.ObjectSchema<OverridablePassProps>;
export declare const PassProps: Joi.ObjectSchema<OverridablePassProps & PassKindsProps & PassPropsFromMethods>;
export interface Template {
    model: string;
    certificates?: CertificatesSchema;
}
export declare const Template: Joi.ObjectSchema<Template>;
/**
 * Performs validation of a schema on an object.
 * If it fails, will throw an error.
 *
 * @param schema
 * @param data
 */
export declare function assertValidity<T>(schema: Joi.ObjectSchema<T> | Joi.StringSchema, data: T, customErrorMessage?: string): void;
/**
 * Performs validation and throws the error if there's one.
 * Otherwise returns a (possibly patched) version of the specified
 * options (it depends on the schema)
 *
 * @param schema
 * @param options
 * @returns
 */
export declare function validate<T extends Object>(schema: Joi.ObjectSchema<T> | Joi.StringSchema, options: T): T;
export declare function filterValid<T extends Object>(schema: Joi.ObjectSchema<T>, source: T[]): T[];
