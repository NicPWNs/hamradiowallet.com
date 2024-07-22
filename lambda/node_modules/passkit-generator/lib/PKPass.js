"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const buffer_1 = require("buffer");
const path_1 = tslib_1.__importDefault(require("path"));
const FieldsArray_1 = tslib_1.__importDefault(require("./FieldsArray"));
const Bundle_1 = tslib_1.__importStar(require("./Bundle"));
const getModelFolderContents_1 = tslib_1.__importDefault(require("./getModelFolderContents"));
const Schemas = tslib_1.__importStar(require("./schemas"));
const Signature = tslib_1.__importStar(require("./Signature"));
const Strings = tslib_1.__importStar(require("./StringsUtils"));
const Utils = tslib_1.__importStar(require("./utils"));
const Messages = tslib_1.__importStar(require("./messages"));
const propsSymbol = Symbol("props");
const localizationSymbol = Symbol("pass.l10n");
const importMetadataSymbol = Symbol("import.pass.metadata");
const createManifestSymbol = Symbol("pass.manifest");
const closePassSymbol = Symbol("pass.close");
const passTypeSymbol = Symbol("pass.type");
const certificatesSymbol = Symbol("pass.certificates");
const RegExps = {
    PASS_JSON: /pass\.json/,
    MANIFEST_OR_SIGNATURE: /manifest|signature/,
    PERSONALIZATION: {
        JSON: /personalization\.json/,
        LOGO: /personalizationLogo@(?:.{2})/,
    },
    PASS_STRINGS: /(?<lang>[a-zA-Z-]{2,}).lproj\/pass\.strings/,
    PASS_ICON: /icon(?:@\d{1}x)?/,
};
class PKPass extends Bundle_1.default {
    /**
     * Either create a pass from another one
     * or a disk path.
     *
     * @param source
     * @returns
     */
    static async from(source, props) {
        let certificates = undefined;
        let buffers = undefined;
        if (!source) {
            throw new TypeError(Messages.format(Messages.FROM.MISSING_SOURCE, source));
        }
        if (source instanceof PKPass) {
            /** Cloning is happening here */
            certificates = source[certificatesSymbol];
            buffers = {};
            const buffersEntries = Object.entries(source[Bundle_1.filesSymbol]);
            /** Cloning all the buffers to prevent unwanted edits */
            for (let i = 0; i < buffersEntries.length; i++) {
                const [fileName, contentBuffer] = buffersEntries[i];
                buffers[fileName] = buffer_1.Buffer.alloc(contentBuffer.length);
                contentBuffer.copy(buffers[fileName]);
            }
            /**
             * Moving props to pass.json instead of overrides
             * because many might get excluded when passing
             * through validation
             */
            buffers["pass.json"] = buffer_1.Buffer.from(JSON.stringify(source[propsSymbol]));
        }
        else {
            Schemas.assertValidity(Schemas.Template, source, Messages.TEMPLATE.INVALID);
            buffers = await (0, getModelFolderContents_1.default)(source.model);
            certificates = source.certificates;
        }
        return new PKPass(buffers, certificates, props);
    }
    /**
     * Creates a Bundle made of PKPass to be distributed
     * as a `.pkpasses` zip file. Returns a Bundle instance
     * so it can be outputted both as stream or as a buffer.
     *
     * Using this will freeze all the instances passed as
     * parameter.
     *
     * Throws if not all the files are instance of PKPass.
     *
     * @param passes
     */
    static pack(...passes) {
        const [bundle, freezeBundle] = Bundle_1.default.freezable("application/vnd.apple.pkpasses");
        for (let i = 0; i < passes.length; i++) {
            const pass = passes[i];
            if (!(pass instanceof PKPass)) {
                throw new Error(Messages.PACK.INVALID);
            }
            bundle.addBuffer(`packed-pass-${i + 1}.pkpass`, pass.getAsBuffer());
        }
        freezeBundle();
        return bundle;
    }
    // **************** //
    // *** INSTANCE *** //
    // **************** //
    constructor(buffers, certificates, props) {
        super("application/vnd.apple.pkpass");
        this[_a] = {};
        this[_b] = {};
        this[_c] = undefined;
        if (buffers && typeof buffers === "object") {
            const buffersEntries = Object.entries(buffers);
            for (let i = buffersEntries.length, buffer; (buffer = buffersEntries[--i]);) {
                const [fileName, contentBuffer] = buffer;
                this.addBuffer(fileName, contentBuffer);
            }
        }
        else {
            console.warn(Messages.format(Messages.INIT.INVALID_BUFFERS, typeof buffers));
        }
        if (props) {
            /** Overrides validation and pushing in props */
            const overridesValidation = Schemas.validate(Schemas.OverridablePassProps, props);
            Object.assign(this[propsSymbol], overridesValidation);
        }
        if (certificates) {
            this.certificates = certificates;
        }
    }
    /**
     * Allows changing the certificates, if needed.
     * They are actually expected to be received in
     * the constructor, but they can get overridden
     * here for whatever purpose.
     *
     * When using this setter, all certificates are
     * expected to be received, or an exception will
     * be thrown.
     *
     * @param certs
     */
    set certificates(certs) {
        Utils.assertUnfrozen(this);
        Schemas.assertValidity(Schemas.CertificatesSchema, certs, Messages.CERTIFICATES.INVALID);
        this[certificatesSymbol] = certs;
    }
    /**
     * Allows retrieving current languages
     */
    get languages() {
        return Object.keys(this[localizationSymbol]);
    }
    /**
     * Allows getting an image of the props
     * that are composing your pass instance.
     */
    get props() {
        return Utils.cloneRecursive(this[propsSymbol]);
    }
    /**
     * Allows setting a transitType property
     * for a boardingPass.
     *
     * @throws if current type is not "boardingPass".
     * @param value
     */
    set transitType(value) {
        Utils.assertUnfrozen(this);
        if (this.type !== "boardingPass") {
            throw new TypeError(Messages.TRANSIT_TYPE.UNEXPECTED_PASS_TYPE);
        }
        Schemas.assertValidity(Schemas.TransitType, value, Messages.TRANSIT_TYPE.INVALID);
        this[propsSymbol]["boardingPass"].transitType = value;
    }
    /**
     * Allows getting the current transitType
     * from pass props.
     *
     * @throws (automatically) if current type is not "boardingPass".
     */
    get transitType() {
        return this[propsSymbol]["boardingPass"].transitType;
    }
    /**
     * Allows accessing to primaryFields object.
     *
     * @throws (automatically) if no valid pass.json
     * 		has been parsed yet or, anyway, if current
     * 		instance has not a valid type set yet.
     */
    get primaryFields() {
        return this[propsSymbol][this.type].primaryFields;
    }
    /**
     * Allows accessing to secondaryFields object
     *
     * @throws (automatically) if no valid pass.json
     * 		has been parsed yet or, anyway, if current
     * 		instance has not a valid type set yet.
     */
    get secondaryFields() {
        return this[propsSymbol][this.type].secondaryFields;
    }
    /**
     * Allows accessing to auxiliaryFields object
     *
     * For Typescript users: this signature allows
     * in any case to add the 'row' field, but on
     * runtime they are only allowed on "eventTicket"
     * passes.
     *
     * @throws (automatically) if no valid pass.json
     * 		has been parsed yet or, anyway, if current
     * 		instance has not a valid type set yet.
     */
    get auxiliaryFields() {
        return this[propsSymbol][this.type].auxiliaryFields;
    }
    /**
     * Allows accessing to headerFields object
     *
     * @throws (automatically) if no valid pass.json
     * 		has been parsed yet or, anyway, if current
     * 		instance has not a valid type set yet.
     */
    get headerFields() {
        return this[propsSymbol][this.type].headerFields;
    }
    /**
     * Allows accessing to backFields object
     *
     * @throws (automatically) if no valid pass.json
     * 		has been parsed yet or, anyway, if current
     * 		instance has not a valid type set yet.
     */
    get backFields() {
        return this[propsSymbol][this.type].backFields;
    }
    /**
     * Allows setting a pass type.
     *
     * **Warning**: setting a type with this setter,
     * will reset all the fields (primaryFields,
     * secondaryFields, headerFields, auxiliaryFields, backFields),
     * both imported or manually set.
     */
    set type(nextType) {
        Utils.assertUnfrozen(this);
        Schemas.assertValidity(Schemas.PassType, nextType, Messages.PASS_TYPE.INVALID);
        /** Shut up, typescript strict mode! */
        const type = nextType;
        if (this.type) {
            /**
             * Removing reference to previous type and its content because
             * we might have some differences between types. It is way easier
             * to reset everything instead of making checks.
             */
            this[propsSymbol][this.type] = undefined;
        }
        const sharedKeysPool = new Set();
        this[passTypeSymbol] = type;
        this[propsSymbol][type] = {
            headerFields /******/: new FieldsArray_1.default(this, sharedKeysPool, Schemas.Field),
            primaryFields /*****/: new FieldsArray_1.default(this, sharedKeysPool, Schemas.Field),
            secondaryFields /***/: new FieldsArray_1.default(this, sharedKeysPool, Schemas.Field),
            auxiliaryFields /***/: new FieldsArray_1.default(this, sharedKeysPool, type === "eventTicket" ? Schemas.FieldWithRow : Schemas.Field),
            backFields /********/: new FieldsArray_1.default(this, sharedKeysPool, Schemas.Field),
            transitType: undefined,
        };
    }
    get type() {
        var _d;
        return (_d = this[passTypeSymbol]) !== null && _d !== void 0 ? _d : undefined;
    }
    // **************************** //
    // *** ASSETS SETUP METHODS *** //
    // **************************** //
    /**
     * Allows adding a new asset inside the pass / bundle with
     * the following exceptions:
     *
     * - Empty buffers are ignored;
     * - `manifest.json` and `signature` files will be ignored;
     * - `pass.json` will be read validated and merged in the
     * 	current instance, if it wasn't added previously.
     * 	It's properties will overwrite the instance ones.
     * 	You might loose data;
     * - `pass.strings` files will be read, parsed and merged
     * 	with the current translations. Comments will be ignored;
     * - `personalization.json` will be read, validated and added.
     * 	They will be stripped out when exporting the pass if
     * 	it won't have NFC details or if any of the personalization
     * 	files is missing;
     *
     * @param pathName
     * @param buffer
     */
    addBuffer(pathName, buffer) {
        if (!(buffer === null || buffer === void 0 ? void 0 : buffer.length)) {
            return;
        }
        if (RegExps.MANIFEST_OR_SIGNATURE.test(pathName)) {
            return;
        }
        if (RegExps.PASS_JSON.test(pathName)) {
            if (this[Bundle_1.filesSymbol]["pass.json"]) {
                /**
                 * Ignoring any further addition. In a
                 * future we might consider merging instead
                 */
                return;
            }
            try {
                this[importMetadataSymbol](validateJSONBuffer(buffer, Schemas.PassProps));
            }
            catch (err) {
                console.warn(Messages.format(Messages.PASS_SOURCE.INVALID, err));
                return;
            }
            /**
             * Adding an empty buffer just for reference
             * that we received a valid pass.json file.
             * It will be reconciliated in export phase.
             */
            return super.addBuffer(pathName, buffer_1.Buffer.alloc(0));
        }
        if (RegExps.PERSONALIZATION.JSON.test(pathName)) {
            /**
             * We are still allowing `personalizationLogo@XX.png`
             * to be added to the bundle, but we'll delete it
             * once the pass is getting closed, if needed.
             */
            try {
                validateJSONBuffer(buffer, Schemas.Personalize);
            }
            catch (err) {
                console.warn(Messages.format(Messages.PERSONALIZE.INVALID, err));
                return;
            }
            return super.addBuffer(pathName, buffer);
        }
        /**
         * Converting Windows path to Unix path
         * @example de.lproj\\icon.png => de.lproj/icon.png
         */
        const normalizedPathName = pathName.replace(path_1.default.sep, "/");
        /**
         * If a new pass.strings file is added, we want to
         * prevent it from being merged and, instead, save
         * its translations for later
         */
        let match;
        if ((match = normalizedPathName.match(RegExps.PASS_STRINGS))) {
            const [, lang] = match;
            const parsedTranslations = Strings.parse(buffer).translations;
            if (!parsedTranslations.length) {
                return;
            }
            this.localize(lang, Object.fromEntries(parsedTranslations));
            return;
        }
        return super.addBuffer(normalizedPathName, buffer);
    }
    /**
     * Given data from a pass.json, reads them to bring them
     * into the current pass instance.
     *
     * @param data
     */
    [(_a = propsSymbol, _b = localizationSymbol, _c = passTypeSymbol, importMetadataSymbol)](data) {
        const possibleTypes = [
            "boardingPass",
            "coupon",
            "eventTicket",
            "storeCard",
            "generic",
        ];
        const type = possibleTypes.find((type) => Boolean(data[type]));
        const { boardingPass, coupon, storeCard, generic, eventTicket, ...otherPassData } = data;
        if (Object.keys(this[propsSymbol]).length) {
            console.warn(Messages.PASS_SOURCE.JOIN);
        }
        Object.assign(this[propsSymbol], otherPassData);
        if (!type) {
            if (!this[passTypeSymbol]) {
                console.warn(Messages.PASS_SOURCE.UNKNOWN_TYPE);
            }
        }
        else {
            this.type = type;
            const { headerFields = [], primaryFields = [], secondaryFields = [], auxiliaryFields = [], backFields = [], transitType, } = data[type] || {};
            this.headerFields.push(...headerFields);
            this.primaryFields.push(...primaryFields);
            this.secondaryFields.push(...secondaryFields);
            this.auxiliaryFields.push(...auxiliaryFields);
            this.backFields.push(...backFields);
            if (this.type === "boardingPass") {
                this.transitType = transitType;
            }
        }
    }
    /**
     * Creates the manifest starting from files
     * added to the bundle
     */
    [createManifestSymbol]() {
        const manifest = Object.entries(this[Bundle_1.filesSymbol]).reduce((acc, [fileName, buffer]) => ({
            ...acc,
            [fileName]: Signature.createHash(buffer),
        }), {});
        return buffer_1.Buffer.from(JSON.stringify(manifest));
    }
    /**
     * Applies the last validation checks against props,
     * applies the props to pass.json and creates l10n
     * files and folders and creates manifest and
     * signature files
     */
    [closePassSymbol]() {
        if (!this.type) {
            throw new TypeError(Messages.CLOSE.MISSING_TYPE);
        }
        const fileNames = Object.keys(this[Bundle_1.filesSymbol]);
        const passJson = buffer_1.Buffer.from(JSON.stringify(this[propsSymbol]));
        super.addBuffer("pass.json", passJson);
        if (!fileNames.some((fileName) => RegExps.PASS_ICON.test(fileName))) {
            console.warn(Messages.CLOSE.MISSING_ICON);
        }
        // *********************************** //
        // *** LOCALIZATION FILES CREATION *** //
        // *********************************** //
        const localizationEntries = Object.entries(this[localizationSymbol]);
        for (let i = localizationEntries.length - 1; i >= 0; i--) {
            const [lang, translations] = localizationEntries[i];
            const stringsFile = Strings.create(translations);
            if (stringsFile.length) {
                super.addBuffer(`${lang}.lproj/pass.strings`, stringsFile);
            }
        }
        // *********************** //
        // *** PERSONALIZATION *** //
        // *********************** //
        const meetsPersonalizationRequirements = Boolean(this[propsSymbol]["nfc"] &&
            this[Bundle_1.filesSymbol]["personalization.json"] &&
            fileNames.find((file) => RegExps.PERSONALIZATION.LOGO.test(file)));
        if (!meetsPersonalizationRequirements) {
            /**
             * Looking for every personalization file
             * and removing it
             */
            for (let i = 0; i < fileNames.length; i++) {
                if (fileNames[i].includes("personalization")) {
                    console.warn(Messages.format(Messages.CLOSE.PERSONALIZATION_REMOVED, fileNames[i]));
                    delete this[Bundle_1.filesSymbol][fileNames[i]];
                }
            }
        }
        // ******************************** //
        // *** BOARDING PASS VALIDATION *** //
        // ******************************** //
        if (this.type === "boardingPass" && !this.transitType) {
            throw new TypeError(Messages.CLOSE.MISSING_TRANSIT_TYPE);
        }
        // ****************************** //
        // *** SIGNATURE AND MANIFEST *** //
        // ****************************** //
        const manifestBuffer = this[createManifestSymbol]();
        super.addBuffer("manifest.json", manifestBuffer);
        const signatureBuffer = Signature.create(manifestBuffer, this[certificatesSymbol]);
        super.addBuffer("signature", signatureBuffer);
    }
    // ************************* //
    // *** EXPORTING METHODS *** //
    // ************************* //
    /**
     * Exports the pass as a zip buffer. When this method
     * is invoked, the bundle will get frozen and, thus,
     * no files will be allowed to be added any further.
     *
     * @returns
     */
    getAsBuffer() {
        if (!this.isFrozen) {
            this[closePassSymbol]();
        }
        return super.getAsBuffer();
    }
    /**
     * Exports the pass as a zip stream. When this method
     * is invoked, the bundle will get frozen and, thus,
     * no files will be allowed to be added any further.
     *
     * @returns
     */
    getAsStream() {
        if (!this.isFrozen) {
            this[closePassSymbol]();
        }
        return super.getAsStream();
    }
    /**
     * Exports the pass as a list of file paths and buffers.
     * When this method is invoked, the bundle will get
     * frozen and, thus, no files will be allowed to be
     * added any further.
     *
     * This allows developers to choose a different way
     * of serving, analyzing or zipping the file, outside the
     * default compression system.
     *
     * @returns a frozen object containing files paths as key
     * 		and Buffers as content.
     */
    getAsRaw() {
        if (!this.isFrozen) {
            this[closePassSymbol]();
        }
        return super.getAsRaw();
    }
    // ************************** //
    // *** DATA SETUP METHODS *** //
    // ************************** //
    /**
     * Allows to add a localization details to the
     * final bundle with some translations.
     *
     * If the language already exists, translations will be
     * merged with the existing ones.
     *
     * Setting `translations` to `null` fully deletes a language,
     * its translations and its files.
     *
     * @see https://developer.apple.com/documentation/walletpasses/creating_the_source_for_a_pass#3736718
     * @param lang
     * @param translations
     */
    localize(lang, translations) {
        var _d;
        var _e;
        Utils.assertUnfrozen(this);
        if (typeof lang !== "string") {
            throw new TypeError(Messages.format(Messages.LANGUAGES.INVALID_LANG, typeof lang));
        }
        if (translations === null) {
            delete this[localizationSymbol][lang];
            const allFilesKeys = Object.keys(this[Bundle_1.filesSymbol]);
            const langFolderIdentifier = `${lang}.lproj`;
            for (let i = allFilesKeys.length - 1; i >= 0; i--) {
                const filePath = allFilesKeys[i];
                if (filePath.startsWith(langFolderIdentifier)) {
                    delete this[Bundle_1.filesSymbol][filePath];
                }
            }
            return;
        }
        if (!translations || !Object.keys(translations).length) {
            console.warn(Messages.format(Messages.LANGUAGES.NO_TRANSLATIONS, lang));
            return;
        }
        (_d = (_e = this[localizationSymbol])[lang]) !== null && _d !== void 0 ? _d : (_e[lang] = {});
        if (typeof translations === "object" && !Array.isArray(translations)) {
            Object.assign(this[localizationSymbol][lang], translations);
        }
    }
    /**
     * Allows to specify an expiration date for the pass.
     *
     * Pass `null` to remove the expiration date.
     *
     * @param date
     * @throws if pass is frozen due to previous export
     * @returns
     */
    setExpirationDate(date) {
        Utils.assertUnfrozen(this);
        if (date === null) {
            delete this[propsSymbol]["expirationDate"];
            return;
        }
        try {
            this[propsSymbol]["expirationDate"] = Utils.processDate(date);
        }
        catch (err) {
            throw new TypeError(Messages.format(Messages.DATE.INVALID, "expirationDate", date));
        }
    }
    setBeacons(...beacons) {
        Utils.assertUnfrozen(this);
        if (beacons[0] === null) {
            delete this[propsSymbol]["beacons"];
            return;
        }
        this[propsSymbol]["beacons"] = Schemas.filterValid(Schemas.Beacon, beacons);
    }
    setLocations(...locations) {
        Utils.assertUnfrozen(this);
        if (locations[0] === null) {
            delete this[propsSymbol]["locations"];
            return;
        }
        this[propsSymbol]["locations"] = Schemas.filterValid(Schemas.Location, locations);
    }
    /**
     * Allows setting a relevant date in which the OS
     * should show this pass.
     *
     * Pass `null` to remove relevant date from this pass.
     *
     * @param {Date | null} date
     * @throws if pass is frozen due to previous export
     */
    setRelevantDate(date) {
        Utils.assertUnfrozen(this);
        if (date === null) {
            delete this[propsSymbol]["relevantDate"];
            return;
        }
        try {
            this[propsSymbol]["relevantDate"] = Utils.processDate(date);
        }
        catch (err) {
            throw new TypeError(Messages.format(Messages.DATE.INVALID, "relevantDate", date));
        }
    }
    setBarcodes(...barcodes) {
        Utils.assertUnfrozen(this);
        if (!barcodes.length) {
            return;
        }
        if (barcodes[0] === null) {
            delete this[propsSymbol]["barcodes"];
            return;
        }
        let finalBarcodes;
        if (typeof barcodes[0] === "string") {
            /**
             * A string has been received instead of objects. We can
             * only auto-fill them all with the same data.
             */
            const supportedFormats = [
                "PKBarcodeFormatQR",
                "PKBarcodeFormatPDF417",
                "PKBarcodeFormatAztec",
                "PKBarcodeFormatCode128",
            ];
            finalBarcodes = supportedFormats.map((format) => Schemas.validate(Schemas.Barcode, {
                format,
                message: barcodes[0],
            }));
        }
        else {
            finalBarcodes = Schemas.filterValid(Schemas.Barcode, barcodes);
        }
        this[propsSymbol]["barcodes"] = finalBarcodes;
    }
    /**
     * Allows to specify details to make this, an
     * NFC-capable pass.
     *
     * Pass `null` as parameter to remove it at all.
     *
     * @see https://developer.apple.com/documentation/walletpasses/pass/nfc
     * @param data
     * @throws if pass is frozen due to previous export
     * @returns
     */
    setNFC(nfc) {
        var _d;
        Utils.assertUnfrozen(this);
        if (nfc === null) {
            delete this[propsSymbol]["nfc"];
            return;
        }
        this[propsSymbol]["nfc"] =
            (_d = Schemas.validate(Schemas.NFC, nfc)) !== null && _d !== void 0 ? _d : undefined;
    }
}
exports.default = PKPass;
function validateJSONBuffer(buffer, schema) {
    let contentAsJSON;
    try {
        contentAsJSON = JSON.parse(buffer.toString("utf8"));
    }
    catch (err) {
        throw new TypeError(Messages.JSON.INVALID);
    }
    return Schemas.validate(schema, contentAsJSON);
}
//# sourceMappingURL=PKPass.js.map