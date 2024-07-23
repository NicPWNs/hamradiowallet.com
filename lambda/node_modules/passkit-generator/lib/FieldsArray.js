"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Schemas = tslib_1.__importStar(require("./schemas"));
const Utils = tslib_1.__importStar(require("./utils"));
const Messages = tslib_1.__importStar(require("./messages"));
/**
 * Class to represent lower-level keys pass fields
 * @see https://apple.co/2wkUBdh
 */
const passInstanceSymbol = Symbol("passInstance");
const sharedKeysPoolSymbol = Symbol("keysPool");
const fieldSchemaSymbol = Symbol("fieldSchema");
class FieldsArray extends Array {
    constructor(passInstance, keysPool, fieldSchema, ...args) {
        super(...args);
        this[fieldSchemaSymbol] = fieldSchema;
        this[passInstanceSymbol] = passInstance;
        this[sharedKeysPoolSymbol] = keysPool;
    }
    push(...items) {
        const validItems = registerWithValidation(this, ...items);
        return super.push(...validItems);
    }
    pop() {
        return unregisterItems(this, () => super.pop());
    }
    splice(start, deleteCount, ...items) {
        // Perfoming frozen check, validation and getting valid items
        const validItems = registerWithValidation(this, ...items);
        for (let i = start; i < start + deleteCount; i++) {
            this[sharedKeysPoolSymbol].delete(this[i].key);
        }
        return super.splice(start, deleteCount, ...validItems);
    }
    shift() {
        return unregisterItems(this, () => super.shift());
    }
    unshift(...items) {
        const validItems = registerWithValidation(this, ...items);
        return super.unshift(...validItems);
    }
}
exports.default = FieldsArray;
function registerWithValidation(instance, ...items) {
    Utils.assertUnfrozen(instance[passInstanceSymbol]);
    let validItems = [];
    for (const field of items) {
        if (!field) {
            console.warn(Messages.format(Messages.FIELDS.INVALID, field));
            continue;
        }
        try {
            Schemas.assertValidity(instance[fieldSchemaSymbol], field, Messages.FIELDS.INVALID);
            if (instance[sharedKeysPoolSymbol].has(field.key)) {
                throw new TypeError(Messages.format(Messages.FIELDS.REPEATED_KEY, field.key));
            }
            instance[sharedKeysPoolSymbol].add(field.key);
            validItems.push(field);
        }
        catch (err) {
            if (err instanceof Error) {
                console.warn(err.message ? err.message : err);
            }
            else {
                console.warn(err);
            }
        }
    }
    return validItems;
}
function unregisterItems(instance, removeFn) {
    Utils.assertUnfrozen(instance[passInstanceSymbol]);
    const element = removeFn();
    instance[sharedKeysPoolSymbol].delete(element.key);
    return element;
}
//# sourceMappingURL=FieldsArray.js.map