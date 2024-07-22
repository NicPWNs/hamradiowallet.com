export declare const INIT: {
    readonly INVALID_BUFFERS: "Cannot set buffers in constructor: expected object but received %s";
};
export declare const CERTIFICATES: {
    readonly INVALID: "Invalid certificate(s) loaded. %s. Please provide valid WWDR certificates and developer signer certificate and key (with passphrase).\nRefer to docs to obtain them";
};
export declare const TRANSIT_TYPE: {
    readonly UNEXPECTED_PASS_TYPE: "Cannot set transitType on a pass with type different from boardingPass.";
    readonly INVALID: "Cannot set transitType because not compliant with Apple specifications. Refer to https://apple.co/3DHuAG4 for more - %s";
};
export declare const PASS_TYPE: {
    readonly INVALID: "Cannot set type because not compliant with Apple specifications. Refer to https://apple.co/3aFpSfg for a list of valid props - %s";
};
export declare const TEMPLATE: {
    readonly INVALID: "Cannot create pass from a template. %s";
};
export declare const FILTER_VALID: {
    readonly INVALID: "Cannot validate property. %s";
};
export declare const FIELDS: {
    readonly INVALID: "Cannot add field. %s";
    readonly REPEATED_KEY: "Cannot add field with key '%s': another field already owns this key. Ignored.";
};
export declare const DATE: {
    readonly INVALID: "Cannot set %s. Invalid date %s";
};
export declare const LANGUAGES: {
    readonly INVALID_LANG: "Cannot set localization. Expected a string for 'lang' but received %s";
    readonly NO_TRANSLATIONS: "Cannot create or use language %s. If your itention was to just add a language (.lproj) folder to the bundle, both specify some translations or use .addBuffer to add some media.";
};
export declare const BARCODES: {
    readonly INVALID_POST: "";
};
export declare const PASS_SOURCE: {
    readonly INVALID: "Cannot add pass.json to bundle because it is invalid. %s";
    readonly UNKNOWN_TYPE: "Cannot find a valid type in pass.json. You won't be able to set fields until you won't set explicitly one.";
    readonly JOIN: "The imported pass.json's properties will be joined with the current setted props. You might lose some data.";
};
export declare const PERSONALIZE: {
    readonly INVALID: "Cannot add personalization.json to bundle because it is invalid. %s";
};
export declare const JSON: {
    readonly INVALID: "Cannot parse JSON. Invalid file";
};
export declare const CLOSE: {
    readonly MISSING_TYPE: "Cannot proceed creating the pass because type is missing.";
    readonly MISSING_ICON: "At least one icon file is missing in your bundle. Your pass won't be openable by any Apple Device.";
    readonly PERSONALIZATION_REMOVED: "Personalization file '%s' have been removed from the bundle as the requirements for personalization are not met.";
    readonly MISSING_TRANSIT_TYPE: "Cannot proceed creating the pass because transitType is missing on your boardingPass.";
};
export declare const MODELS: {
    readonly DIR_NOT_FOUND: "Cannot import model: directory %s not found.";
    readonly FILE_NO_OPEN: "Cannot open model file. %s";
};
export declare const BUNDLE: {
    readonly MIME_TYPE_MISSING: "Cannot build Bundle. MimeType is missing";
    readonly CLOSED: "Cannot add file or set property. Bundle is closed.";
};
export declare const FROM: {
    readonly MISSING_SOURCE: "Cannot create PKPass from source: source is '%s'";
};
export declare const PACK: {
    readonly INVALID: "Cannot pack passes. Only PKPass instances allowed";
};
/**
 * Creates a message with replaced values
 * @param messageName
 * @param values
 */
export declare function format(messageName: string, ...values: any[]): string;
