"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Beacon = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
exports.Beacon = joi_1.default.object().keys({
    major: joi_1.default.number().integer().min(0).max(65535),
    minor: joi_1.default.number().integer().min(0).max(65535),
    proximityUUID: joi_1.default.string().required(),
    relevantText: joi_1.default.string(),
});
//# sourceMappingURL=Beacon.js.map