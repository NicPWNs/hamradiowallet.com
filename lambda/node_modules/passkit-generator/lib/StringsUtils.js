"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.parse = void 0;
const os_1 = require("os");
const buffer_1 = require("buffer");
// ************************************ //
// *** UTILS FOR PASS.STRINGS FILES *** //
// ************************************ //
/**
 * Parses a string file to convert it to
 * an object
 *
 * @param buffer
 * @returns
 */
function parse(buffer) {
    const fileAsString = buffer.toString("utf8");
    const translationRowRegex = /"(?<key>.+)"\s+=\s+"(?<value>.+)";\n?/;
    const commentRowRegex = /\/\*\s*(.+)\s*\*\//;
    let translations = [];
    let comments = [];
    let blockStartPoint = 0;
    let blockEndPoint = 0;
    do {
        if (
        /** New Line, new life */
        /\n/.test(fileAsString[blockEndPoint]) ||
            /** EOF  */
            blockEndPoint === fileAsString.length) {
            let match;
            const section = fileAsString.substring(blockStartPoint, blockEndPoint + 1);
            if ((match = section.match(translationRowRegex)) && match.groups) {
                const { groups: { key, value }, } = match;
                translations.push([key, value]);
            }
            else if ((match = section.match(commentRowRegex))) {
                const [, content] = match;
                comments.push(content.trimEnd());
            }
            /** Skipping \n and going to the next block. */
            blockEndPoint += 2;
            blockStartPoint = blockEndPoint - 1;
        }
        else {
            blockEndPoint += 1;
        }
    } while (blockEndPoint <= fileAsString.length);
    return {
        translations,
        comments,
    };
}
exports.parse = parse;
/**
 * Creates a strings file buffer
 *
 * @param translations
 * @returns
 */
function create(translations) {
    const stringContents = [];
    const translationsEntries = Object.entries(translations);
    for (let i = 0; i < translationsEntries.length; i++) {
        const [key, value] = translationsEntries[i];
        stringContents.push(`"${key}" = "${value}";`);
    }
    return buffer_1.Buffer.from(stringContents.join(os_1.EOL));
}
exports.create = create;
//# sourceMappingURL=StringsUtils.js.map