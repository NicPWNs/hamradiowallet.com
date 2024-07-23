import fs from "fs";
import passkit from "passkit-generator";
const PKPass = passkit.PKPass;

async function getData(callsign) {
  var userData = fs.readFileSync("./data/EN.dat").toString().split("\n");
  var licenseData = fs.readFileSync("./data/HD.dat").toString().split("\n");

  let row = 0;

  for (var i = 0; i < userData.length; i++) {
    if (userData[i].match(callsign)) {
      row = i;
    }
  }

  let firstName = userData[row].split("|")[8];
  let lastName = userData[row].split("|")[10];
  let zipcode = userData[row].split("|")[18];
  let frn = userData[row].split("|")[22];

  row = 0;

  for (var i = 0; i < licenseData.length; i++) {
    if (licenseData[i].match(callsign)) {
      row = i;
    }
  }

  let grantDate = licenseData[row].split("|")[7];
  let expireDate = licenseData[row].split("|")[8];
  let effectiveDate = licenseData[row].split("|")[42];

  grantDate = new Date(grantDate).toISOString();
  expireDate = new Date(expireDate).toISOString();
  effectiveDate = new Date(effectiveDate).toISOString();

  var data = {
    frn: frn,
    callsign: callsign,
    name: firstName + " " + lastName,
    privileges: "General",
    grantDate: grantDate,
    effectiveDate: effectiveDate,
    expirationDate: expireDate,
  };

  return data;
}

async function createPass(data) {
  try {
    const wwdr = fs.readFileSync("./certs/wwdr.pem");
    const signerCert = fs.readFileSync("./certs/pass.pem");
    const signerKey = fs.readFileSync("./certs/passkit.key");

    const pass = await PKPass.from(
      {
        model: "./hamradiowallet.pass",
        certificates: {
          wwdr,
          signerCert,
          signerKey,
        },
      },
      {
        serialNumber: data.frn,
      }
    );

    pass.setRelevantDate(new Date("2023-10-31"));
    pass.setExpirationDate(new Date("2033-10-31"));
    pass.setBarcodes({
      format: "PKBarcodeFormatQR",
      message: "https://hamradiowallet.com",
      messageEncoding: "iso-8859-1",
    });

    pass.headerFields.push({
      key: "callsign",
      label: "CALL SIGN",
      value: data.callsign,
    });

    pass.primaryFields.push({
      key: "name",
      label: "NAME",
      value: data.name,
    });

    pass.secondaryFields.push({
      key: "privileges",
      label: "PRIVILEGES",
      value: data.privileges,
    });

    pass.auxiliaryFields.push(
      {
        key: "fcc",
        label: "FCC REGISTRATION NUMBER",
        value: data.frn,
        row: 0,
      },
      {
        key: "granted",
        label: "GRANT DATE",
        value: data.grantDate,
        dateStyle: "PKDateStyleLong",
        row: 0,
      },
      {
        key: "effective",
        label: "EFFECTIVE DATE",
        value: data.effectiveDate,
        dateStyle: "PKDateStyleLong",
        row: 1,
      },
      {
        key: "expiration",
        label: "EXPIRATION DATE",
        value: data.expirationDate,
        dateStyle: "PKDateStyleLong",
        row: 1,
      }
    );

    const buffer = pass.getAsBuffer();
    fs.writeFileSync("hamradiowallet.pkpass", buffer);
    return buffer;
  } catch (e) {
    console.error(e);
    return 500;
  }
}

exports.handler = async function (event, context) {
  var callsign = event.queryStringParameters.callsign;
  var zipcode = event.queryStringParameters.zipcode;

  var data = await getData(callsign);
  var pass = await createPass(data);

  const response = {
    headers: {
      "Access-Control-Allow-Origin": "hamradiowallet.com",
    },
    statusCode: 200,
    body: pass,
  };

  return response;
};

exports.handler();
