const { PKPass } = require("passkit-generator");

exports.handler = async function (event, context) {
  try {
    const wwdr = "";
    const signerCert = "";
    const signerKey = "";
    const signerKeyPassphrase = "";

    const pass = await PKPass.from(
      {
        model: "./passModels/myFirstModel.pass",
        certificates: {
          wwdr,
          signerCert,
          signerKey,
          signerKeyPassphrase,
        },
      },
      {
        serialNumber: "AAGH44625236dddaffbda",
      }
    );

    pass.setBarcodes("1234567890");

    const buffer = pass.getAsBuffer();
    return buffer;
  } catch (e) {
    console.error(e);
    return 500;
  }
};

exports.handler();
