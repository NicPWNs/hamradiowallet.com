import Joi from "joi";
import { Semantics } from "./Semantics";
export type PKDataDetectorType = "PKDataDetectorTypePhoneNumber" | "PKDataDetectorTypeLink" | "PKDataDetectorTypeAddress" | "PKDataDetectorTypeCalendarEvent";
export type PKTextAlignmentType = "PKTextAlignmentLeft" | "PKTextAlignmentCenter" | "PKTextAlignmentRight" | "PKTextAlignmentNatural";
export type PKDateStyleType = "PKDateStyleNone" | "PKDateStyleShort" | "PKDateStyleMedium" | "PKDateStyleLong" | "PKDateStyleFull";
export type PKNumberStyleType = "PKNumberStyleDecimal" | "PKNumberStylePercent" | "PKNumberStyleScientific" | "PKNumberStyleSpellOut";
/**
 * @see https://developer.apple.com/documentation/walletpasses/passfieldcontent
 */
export interface Field {
    attributedValue?: string | number | Date;
    changeMessage?: string;
    dataDetectorTypes?: PKDataDetectorType[];
    label?: string;
    textAlignment?: PKTextAlignmentType;
    key: string;
    value: string | number | Date;
    semantics?: Semantics;
    dateStyle?: PKDateStyleType;
    ignoresTimeZone?: boolean;
    isRelative?: boolean;
    timeStyle?: string;
    currencyCode?: string;
    numberStyle?: PKNumberStyleType;
}
export interface FieldWithRow extends Field {
    row?: 0 | 1;
}
export declare const Field: Joi.ObjectSchema<Field>;
export declare const FieldWithRow: Joi.ObjectSchema<Field>;
