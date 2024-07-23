import type PKPass from "./PKPass";
import * as Schemas from "./schemas";
/**
 * Class to represent lower-level keys pass fields
 * @see https://apple.co/2wkUBdh
 */
declare const passInstanceSymbol: unique symbol;
declare const sharedKeysPoolSymbol: unique symbol;
export default class FieldsArray extends Array<Schemas.Field> {
    private [passInstanceSymbol];
    private [sharedKeysPoolSymbol];
    constructor(passInstance: InstanceType<typeof PKPass>, keysPool: Set<string>, fieldSchema: typeof Schemas.Field | typeof Schemas.FieldWithRow, ...args: Schemas.Field[]);
    push(...items: Schemas.Field[]): number;
    pop(): Schemas.Field;
    splice(start: number, deleteCount: number, ...items: Schemas.Field[]): Schemas.Field[];
    shift(): Schemas.Field;
    unshift(...items: Schemas.Field[]): number;
}
export {};
