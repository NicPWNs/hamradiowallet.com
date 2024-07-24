"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUnfrozen = exports.cloneRecursive = exports.removeHidden = exports.processDate = void 0;
const tslib_1 = require("tslib");
const Messages = tslib_1.__importStar(require("./messages"));
/**
 * Converts a date to W3C / UTC string
 * @param date
 * @returns
 */
function processDate(date) {
    if (!(date instanceof Date) || Number.isNaN(Number(date))) {
        throw "Invalid date";
    }
    /**
     * @see https://www.w3.org/TR/NOTE-datetime
     */
    return date.toISOString();
}
exports.processDate = processDate;
/**
 * Removes hidden files from a list (those starting with dot)
 *
 * @params from - list of file names
 * @return
 */
function removeHidden(from) {
    return from.filter((e) => e.charAt(0) !== ".");
}
exports.removeHidden = removeHidden;
/**
 * Clones recursively an object and all of its properties
 *
 * @param object
 * @returns
 */
function cloneRecursive(object) {
    const objectCopy = {};
    const objectEntries = Object.entries(object);
    for (let i = 0; i < objectEntries.length; i++) {
        const [key, value] = objectEntries[i];
        if (value && typeof value === "object") {
            if (Array.isArray(value)) {
                objectCopy[key] = value.slice();
                for (let j = 0; j < value.length; j++) {
                    objectCopy[key][j] = cloneRecursive(value[j]);
                }
            }
            else {
                objectCopy[key] = cloneRecursive(value);
            }
        }
        else {
            objectCopy[key] = value;
        }
    }
    return objectCopy;
}
exports.cloneRecursive = cloneRecursive;
function assertUnfrozen(instance) {
    if (instance.isFrozen) {
        throw new Error(Messages.BUNDLE.CLOSED);
    }
}
exports.assertUnfrozen = assertUnfrozen;
//# sourceMappingURL=utils.js.map