"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFC = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
exports.NFC = joi_1.default.object().keys({
    message: joi_1.default.string().required().max(64),
    encryptionPublicKey: joi_1.default.string().required(),
    requiresAuthentication: joi_1.default.boolean(),
});
//# sourceMappingURL=NFC.js.map