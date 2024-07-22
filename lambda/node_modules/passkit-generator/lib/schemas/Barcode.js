"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Barcode = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
exports.Barcode = joi_1.default.object().keys({
    altText: joi_1.default.string(),
    messageEncoding: joi_1.default.string().default("iso-8859-1"),
    format: joi_1.default.string()
        .required()
        .regex(/(PKBarcodeFormatQR|PKBarcodeFormatPDF417|PKBarcodeFormatAztec|PKBarcodeFormatCode128)/, "barcodeType"),
    message: joi_1.default.string().required(),
});
//# sourceMappingURL=Barcode.js.map