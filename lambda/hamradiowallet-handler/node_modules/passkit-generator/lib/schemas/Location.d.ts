import Joi from "joi";
/**
 * @see https://developer.apple.com/documentation/walletpasses/pass/locations
 */
export interface Location {
    relevantText?: string;
    altitude?: number;
    latitude: number;
    longitude: number;
}
export declare const Location: Joi.ObjectSchema<Location>;
