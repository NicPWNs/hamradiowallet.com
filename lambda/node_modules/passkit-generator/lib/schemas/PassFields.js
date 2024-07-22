"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassFields = exports.TransitType = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
const Field_1 = require("./Field");
exports.TransitType = joi_1.default.string().regex(/(PKTransitTypeAir|PKTransitTypeBoat|PKTransitTypeBus|PKTransitTypeGeneric|PKTransitTypeTrain)/);
exports.PassFields = joi_1.default.object().keys({
    auxiliaryFields: joi_1.default.array().items(Field_1.FieldWithRow),
    backFields: joi_1.default.array().items(Field_1.Field),
    headerFields: joi_1.default.array().items(Field_1.Field),
    primaryFields: joi_1.default.array().items(Field_1.Field),
    secondaryFields: joi_1.default.array().items(Field_1.Field),
    transitType: exports.TransitType,
});
//# sourceMappingURL=PassFields.js.map