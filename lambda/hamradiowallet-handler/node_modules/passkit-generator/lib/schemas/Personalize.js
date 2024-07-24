"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Personalize = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
exports.Personalize = joi_1.default.object().keys({
    description: joi_1.default.string().required(),
    requiredPersonalizationFields: joi_1.default.array()
        .items("PKPassPersonalizationFieldName", "PKPassPersonalizationFieldPostalCode", "PKPassPersonalizationFieldEmailAddress", "PKPassPersonalizationFieldPhoneNumber")
        .required(),
    termsAndConditions: joi_1.default.string(),
});
//# sourceMappingURL=Personalize.js.map