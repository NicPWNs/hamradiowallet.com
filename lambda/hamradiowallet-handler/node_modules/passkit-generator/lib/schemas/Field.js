"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldWithRow = exports.Field = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
const Semantics_1 = require("./Semantics");
exports.Field = joi_1.default.object().keys({
    attributedValue: joi_1.default.alternatives(joi_1.default.string().allow(""), joi_1.default.number(), joi_1.default.date().iso()),
    changeMessage: joi_1.default.string(),
    dataDetectorTypes: joi_1.default.array().items(joi_1.default.string().regex(/(PKDataDetectorTypePhoneNumber|PKDataDetectorTypeLink|PKDataDetectorTypeAddress|PKDataDetectorTypeCalendarEvent)/, "dataDetectorType")),
    label: joi_1.default.string().allow(""),
    textAlignment: joi_1.default.string().regex(/(PKTextAlignmentLeft|PKTextAlignmentCenter|PKTextAlignmentRight|PKTextAlignmentNatural)/, "graphic-alignment"),
    key: joi_1.default.string().required(),
    value: joi_1.default.alternatives(joi_1.default.string().allow(""), joi_1.default.number(), joi_1.default.date().iso()).required(),
    semantics: Semantics_1.Semantics,
    // date fields formatters, all optionals
    dateStyle: joi_1.default.string().regex(/(PKDateStyleNone|PKDateStyleShort|PKDateStyleMedium|PKDateStyleLong|PKDateStyleFull)/, "date style"),
    ignoresTimeZone: joi_1.default.boolean(),
    isRelative: joi_1.default.boolean(),
    timeStyle: joi_1.default.string().regex(/(PKDateStyleNone|PKDateStyleShort|PKDateStyleMedium|PKDateStyleLong|PKDateStyleFull)/, "date style"),
    // number fields formatters, all optionals
    currencyCode: joi_1.default.string().when("value", {
        is: joi_1.default.number(),
        otherwise: joi_1.default.string().forbidden(),
    }),
    numberStyle: joi_1.default.string()
        .regex(/(PKNumberStyleDecimal|PKNumberStylePercent|PKNumberStyleScientific|PKNumberStyleSpellOut)/)
        .when("value", {
        is: joi_1.default.number(),
        otherwise: joi_1.default.string().forbidden(),
    }),
});
exports.FieldWithRow = exports.Field.concat(joi_1.default.object().keys({
    row: joi_1.default.number().min(0).max(1),
}));
//# sourceMappingURL=Field.js.map