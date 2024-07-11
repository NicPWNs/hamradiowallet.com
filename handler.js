const { PKPass } = require("passkit-generator");
var fs = require("fs");

exports.handler = async function (event, context) {
  try {
    const wwdr = fs.readFileSync("./certs/wwdr.pem");
    const signerCert = fs.readFileSync("./certs/pass.pem");
    const signerKey = fs.readFileSync("./certs/passkit.key");

    const pass = await PKPass.from({
      model: "./hamradiowallet.pass",
      certificates: {
        wwdr,
        signerCert,
        signerKey,
      },
    });

    pass.setBarcodes("1234567890");

    const buffer = pass.getAsBuffer();
    fs.writeFileSync("out.pkpass", buffer);
    return buffer;
  } catch (e) {
    console.error(e);
    return 500;
  }
};

exports.handler();
