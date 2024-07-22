import Joi from "joi";
/**
 * @see https://developer.apple.com/documentation/walletpasses/pass/nfc
 */
export interface NFC {
    message: string;
    encryptionPublicKey: string;
    requiresAuthentication?: boolean;
}
export declare const NFC: Joi.ObjectSchema<NFC>;
