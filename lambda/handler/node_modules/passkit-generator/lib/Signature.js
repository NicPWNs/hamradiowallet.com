"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.createHash = void 0;
const tslib_1 = require("tslib");
const node_forge_1 = tslib_1.__importDefault(require("node-forge"));
const buffer_1 = require("buffer");
/**
 * Creates an hash for a buffer. Used by manifest
 *
 * @param buffer
 * @returns
 */
function createHash(buffer) {
    const hashFlow = node_forge_1.default.md.sha1.create();
    hashFlow.update(buffer.toString("binary"));
    return hashFlow.digest().toHex();
}
exports.createHash = createHash;
/**
 * Generates the PKCS #7 cryptografic signature for the manifest file.
 *
 * @method create
 * @params manifest
 * @params certificates
 * @returns
 */
function create(manifestBuffer, certificates) {
    const signature = node_forge_1.default.pkcs7.createSignedData();
    signature.content = new node_forge_1.default.util.ByteStringBuffer(manifestBuffer);
    const { wwdr, signerCert, signerKey } = parseCertificates(getStringCertificates(certificates));
    signature.addCertificate(wwdr);
    signature.addCertificate(signerCert);
    /**
     * authenticatedAttributes belong to PKCS#9 standard.
     * It requires at least 2 values:
     * • content-type (which is a PKCS#7 oid) and
     * • message-digest oid.
     *
     * Wallet requires a signingTime.
     */
    signature.addSigner({
        key: signerKey,
        certificate: signerCert,
        digestAlgorithm: node_forge_1.default.pki.oids.sha1,
        authenticatedAttributes: [
            {
                type: node_forge_1.default.pki.oids.contentType,
                value: node_forge_1.default.pki.oids.data,
            },
            {
                type: node_forge_1.default.pki.oids.messageDigest,
            },
            {
                type: node_forge_1.default.pki.oids.signingTime,
            },
        ],
    });
    /**
     * We are creating a detached signature because we don't need the signed content.
     * Detached signature is a property of PKCS#7 cryptography standard.
     */
    signature.sign({ detached: true });
    /**
     * Signature here is an ASN.1 valid structure (DER-compliant).
     * Generating a non-detached signature, would have pushed inside signature.contentInfo
     * (which has type 16, or "SEQUENCE", and is an array) a Context-Specific element, with the
     * signed content as value.
     *
     * In fact the previous approach was to generating a detached signature and the pull away the generated
     * content.
     *
     * That's what happens when you copy a fu****g line without understanding what it does.
     * Well, nevermind, it was funny to study BER, DER, CER, ASN.1 and PKCS#7. You can learn a lot
     * of beautiful things. ¯\_(ツ)_/¯
     */
    return buffer_1.Buffer.from(node_forge_1.default.asn1.toDer(signature.toAsn1()).getBytes(), "binary");
}
exports.create = create;
/**
 * Parses the PEM-formatted passed text (certificates)
 *
 * @param element - Text content of .pem files
 * @param passphrase - passphrase for the key
 * @returns The parsed certificate or key in node forge format
 */
function parseCertificates(certificates) {
    const { signerCert, signerKey, wwdr, signerKeyPassphrase } = certificates;
    return {
        signerCert: node_forge_1.default.pki.certificateFromPem(signerCert.toString("utf-8")),
        wwdr: node_forge_1.default.pki.certificateFromPem(wwdr.toString("utf-8")),
        signerKey: node_forge_1.default.pki.decryptRsaPrivateKey(signerKey.toString("utf-8"), signerKeyPassphrase),
    };
}
function getStringCertificates(certificates) {
    return {
        signerKeyPassphrase: certificates.signerKeyPassphrase,
        wwdr: buffer_1.Buffer.from(certificates.wwdr).toString("utf-8"),
        signerCert: buffer_1.Buffer.from(certificates.signerCert).toString("utf-8"),
        signerKey: buffer_1.Buffer.from(certificates.signerKey).toString("utf-8"),
    };
}
//# sourceMappingURL=Signature.js.map