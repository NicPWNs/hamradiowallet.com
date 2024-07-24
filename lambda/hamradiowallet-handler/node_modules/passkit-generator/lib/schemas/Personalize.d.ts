import Joi from "joi";
/**
 * @see https://developer.apple.com/documentation/walletpasses/personalize
 */
type RequiredPersonalizationFields = "PKPassPersonalizationFieldName" | "PKPassPersonalizationFieldPostalCode" | "PKPassPersonalizationFieldEmailAddress" | "PKPassPersonalizationFieldPhoneNumber";
export interface Personalize {
    description: string;
    requiredPersonalizationFields: RequiredPersonalizationFields[];
    termsAndConditions?: string;
}
export declare const Personalize: Joi.ObjectSchema<Personalize>;
export {};
