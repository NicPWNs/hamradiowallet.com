"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesSchema = void 0;
const tslib_1 = require("tslib");
const buffer_1 = require("buffer");
const joi_1 = tslib_1.__importDefault(require("joi"));
/**
 * Joi.binary is not available in browser-like environments (like Cloudflare workers)
 * so we fallback to manual checking. Buffer must be polyfilled.
 */
const binary = joi_1.default.binary
    ? joi_1.default.binary()
    : joi_1.default.custom((obj) => buffer_1.Buffer.isBuffer(obj));
exports.CertificatesSchema = joi_1.default.object()
    .keys({
    wwdr: joi_1.default.alternatives(binary, joi_1.default.string()).required(),
    signerCert: joi_1.default.alternatives(binary, joi_1.default.string()).required(),
    signerKey: joi_1.default.alternatives(binary, joi_1.default.string()).required(),
    signerKeyPassphrase: joi_1.default.string(),
})
    .required();
//# sourceMappingURL=Certificates.js.map