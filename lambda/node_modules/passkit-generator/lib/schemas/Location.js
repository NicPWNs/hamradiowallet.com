"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
exports.Location = joi_1.default.object().keys({
    altitude: joi_1.default.number(),
    latitude: joi_1.default.number().required(),
    longitude: joi_1.default.number().required(),
    relevantText: joi_1.default.string(),
});
//# sourceMappingURL=Location.js.map