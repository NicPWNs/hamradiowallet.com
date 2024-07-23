"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const Utils = tslib_1.__importStar(require("./utils"));
const Messages = tslib_1.__importStar(require("./messages"));
const fs_1 = require("fs");
/**
 * Reads the model folder contents
 *
 * @param model
 * @returns A promise of an object containing all
 * 		filePaths and the relative buffer
 */
async function getModelFolderContents(model) {
    try {
        const modelPath = `${model}${(!path.extname(model) && ".pass") || ""}`;
        const modelFilesList = await fs_1.promises.readdir(modelPath);
        // No dot-starting files, manifest and signature and only files with an extension
        const modelSuitableRootPaths = Utils.removeHidden(modelFilesList).filter((f) => !/(manifest|signature)/i.test(f) &&
            /.+$/.test(path.parse(f).ext));
        const modelRecords = await Promise.all(modelSuitableRootPaths.map((fileOrDirectoryPath) => readFileOrDirectory(path.resolve(modelPath, fileOrDirectoryPath))));
        return Object.fromEntries(modelRecords.flat(1));
    }
    catch (err) {
        if (!isErrorErrNoException(err) || !isMissingFileError(err)) {
            throw err;
        }
        if (isFileReadingFailure(err)) {
            throw new Error(Messages.format(Messages.MODELS.FILE_NO_OPEN, JSON.stringify(err)));
        }
        if (isDirectoryReadingFailure(err)) {
            throw new Error(Messages.format(Messages.MODELS.DIR_NOT_FOUND, err.path));
        }
        throw err;
    }
}
exports.default = getModelFolderContents;
function isErrorErrNoException(err) {
    return Object.prototype.hasOwnProperty.call(err, "errno");
}
function isMissingFileError(err) {
    return err.code === "ENOENT";
}
function isDirectoryReadingFailure(err) {
    return err.syscall === "scandir";
}
function isFileReadingFailure(err) {
    return err.syscall === "open";
}
/**
 * Allows reading both a whole directory or a set of
 * file in the same flow
 *
 * @param filePath
 * @returns
 */
async function readFileOrDirectory(filePath) {
    const stats = await fs_1.promises.lstat(filePath);
    if (stats.isDirectory()) {
        return readFilesInDirectory(filePath);
    }
    else {
        return getFileContents(filePath).then((result) => [result]);
    }
}
/**
 * Reads a directory and returns all
 * the files in it
 *
 * @param filePath
 * @returns
 */
async function readFilesInDirectory(filePath) {
    const dirContent = await fs_1.promises.readdir(filePath).then(Utils.removeHidden);
    return Promise.all(dirContent.map((fileName) => getFileContents(path.resolve(filePath, fileName), 2)));
}
/**
 * @param filePath
 * @param pathSlicesDepthFromEnd used to preserve localization lproj content
 * @returns
 */
async function getFileContents(filePath, pathSlicesDepthFromEnd = 1) {
    const fileComponents = filePath.split(path.sep);
    const fileName = fileComponents
        .slice(fileComponents.length - pathSlicesDepthFromEnd)
        .join("/");
    const content = await fs_1.promises.readFile(filePath);
    return [fileName, content];
}
//# sourceMappingURL=getModelFolderContents.js.map