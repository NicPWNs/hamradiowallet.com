"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterValid = exports.validate = exports.assertValidity = exports.Template = exports.PassProps = exports.OverridablePassProps = exports.PassType = exports.PassKindsProps = exports.PassPropsFromMethods = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./Barcode"), exports);
tslib_1.__exportStar(require("./Beacon"), exports);
tslib_1.__exportStar(require("./Location"), exports);
tslib_1.__exportStar(require("./Field"), exports);
tslib_1.__exportStar(require("./NFC"), exports);
tslib_1.__exportStar(require("./Semantics"), exports);
tslib_1.__exportStar(require("./PassFields"), exports);
tslib_1.__exportStar(require("./Personalize"), exports);
tslib_1.__exportStar(require("./Certificates"), exports);
const joi_1 = tslib_1.__importDefault(require("joi"));
const Barcode_1 = require("./Barcode");
const Location_1 = require("./Location");
const Beacon_1 = require("./Beacon");
const NFC_1 = require("./NFC");
const PassFields_1 = require("./PassFields");
const Semantics_1 = require("./Semantics");
const Messages = tslib_1.__importStar(require("../messages"));
const RGB_COLOR_REGEX = /rgb\(\s*(?:[01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\s*,\s*(?:[01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\s*,\s*(?:[01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\s*\)/;
exports.PassPropsFromMethods = joi_1.default.object({
    nfc: NFC_1.NFC,
    beacons: joi_1.default.array().items(Beacon_1.Beacon),
    barcodes: joi_1.default.array().items(Barcode_1.Barcode),
    relevantDate: joi_1.default.string().isoDate(),
    expirationDate: joi_1.default.string().isoDate(),
    locations: joi_1.default.array().items(Location_1.Location),
});
exports.PassKindsProps = joi_1.default.object({
    coupon: PassFields_1.PassFields.disallow("transitType"),
    generic: PassFields_1.PassFields.disallow("transitType"),
    storeCard: PassFields_1.PassFields.disallow("transitType"),
    eventTicket: PassFields_1.PassFields.disallow("transitType"),
    boardingPass: PassFields_1.PassFields,
});
exports.PassType = joi_1.default.string().regex(/(boardingPass|coupon|eventTicket|storeCard|generic)/);
exports.OverridablePassProps = joi_1.default.object({
    formatVersion: joi_1.default.number().default(1),
    semantics: Semantics_1.Semantics,
    voided: joi_1.default.boolean(),
    logoText: joi_1.default.string(),
    description: joi_1.default.string(),
    serialNumber: joi_1.default.string(),
    appLaunchURL: joi_1.default.string(),
    teamIdentifier: joi_1.default.string(),
    organizationName: joi_1.default.string(),
    passTypeIdentifier: joi_1.default.string(),
    sharingProhibited: joi_1.default.boolean(),
    groupingIdentifier: joi_1.default.string(),
    suppressStripShine: joi_1.default.boolean(),
    maxDistance: joi_1.default.number().positive(),
    authenticationToken: joi_1.default.string().min(16),
    labelColor: joi_1.default.string().regex(RGB_COLOR_REGEX),
    backgroundColor: joi_1.default.string().regex(RGB_COLOR_REGEX),
    foregroundColor: joi_1.default.string().regex(RGB_COLOR_REGEX),
    associatedStoreIdentifiers: joi_1.default.array().items(joi_1.default.number()),
    userInfo: joi_1.default.alternatives(joi_1.default.object().unknown(), joi_1.default.array()),
    // parsing url as set of words and nums followed by dots, optional port and any possible path after
    webServiceURL: joi_1.default.string().regex(/https?:\/\/(?:[a-z0-9]+\.?)+(?::\d{2,})?(?:\/[\S]+)*/),
}).with("webServiceURL", "authenticationToken");
exports.PassProps = joi_1.default.object()
    .concat(exports.OverridablePassProps)
    .concat(exports.PassKindsProps)
    .concat(exports.PassPropsFromMethods);
exports.Template = joi_1.default.object({
    model: joi_1.default.string().required(),
    certificates: joi_1.default.object().required(),
});
// --------- UTILITIES ---------- //
/**
 * Performs validation of a schema on an object.
 * If it fails, will throw an error.
 *
 * @param schema
 * @param data
 */
function assertValidity(schema, data, customErrorMessage) {
    const validation = schema.validate(data);
    if (validation.error) {
        if (customErrorMessage) {
            console.warn(validation.error);
            throw new TypeError(`${validation.error.name} happened. ${Messages.format(customErrorMessage, validation.error.message)}`);
        }
        throw new TypeError(validation.error.message);
    }
}
exports.assertValidity = assertValidity;
/**
 * Performs validation and throws the error if there's one.
 * Otherwise returns a (possibly patched) version of the specified
 * options (it depends on the schema)
 *
 * @param schema
 * @param options
 * @returns
 */
function validate(schema, options) {
    const validationResult = schema.validate(options, {
        stripUnknown: true,
        abortEarly: true,
    });
    if (validationResult.error) {
        throw validationResult.error;
    }
    return validationResult.value;
}
exports.validate = validate;
function filterValid(schema, source) {
    if (!source) {
        return [];
    }
    return source.reduce((acc, current) => {
        try {
            return [...acc, validate(schema, current)];
        }
        catch (err) {
            console.warn(Messages.format(Messages.FILTER_VALID.INVALID, err));
            return [...acc];
        }
    }, []);
}
exports.filterValid = filterValid;
//# sourceMappingURL=index.js.map