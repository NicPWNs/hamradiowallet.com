import type Bundle from "./Bundle";
/**
 * Converts a date to W3C / UTC string
 * @param date
 * @returns
 */
export declare function processDate(date: Date): string | undefined;
/**
 * Removes hidden files from a list (those starting with dot)
 *
 * @params from - list of file names
 * @return
 */
export declare function removeHidden(from: Array<string>): Array<string>;
/**
 * Clones recursively an object and all of its properties
 *
 * @param object
 * @returns
 */
export declare function cloneRecursive<T extends Object>(object: T): Record<keyof T, any>;
export declare function assertUnfrozen(instance: InstanceType<typeof Bundle>): asserts instance is Bundle & {
    isFrozen: false;
};
