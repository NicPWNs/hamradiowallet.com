import Joi from "joi";
import { Field, FieldWithRow } from "./Field";
export type TransitType = "PKTransitTypeAir" | "PKTransitTypeBoat" | "PKTransitTypeBus" | "PKTransitTypeGeneric" | "PKTransitTypeTrain";
export declare const TransitType: Joi.StringSchema;
export interface PassFields {
    auxiliaryFields: FieldWithRow[];
    backFields: Field[];
    headerFields: Field[];
    primaryFields: Field[];
    secondaryFields: Field[];
    transitType?: TransitType;
}
export declare const PassFields: Joi.ObjectSchema<PassFields>;
