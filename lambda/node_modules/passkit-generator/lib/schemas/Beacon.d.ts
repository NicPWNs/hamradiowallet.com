import Joi from "joi";
/**
 * @see https://developer.apple.com/documentation/walletpasses/pass/beacons
 */
export interface Beacon {
    major?: number;
    minor?: number;
    relevantText?: string;
    proximityUUID: string;
}
export declare const Beacon: Joi.ObjectSchema<Beacon>;
