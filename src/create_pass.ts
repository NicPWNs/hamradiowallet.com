import { Resource } from "sst";
import { PKPass } from "passkit-generator";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutBucketLifecycleConfigurationCommand,
} from "@aws-sdk/client-s3";

// Initialize S3 client
const s3 = new S3Client({});

export async function handler(event: APIGatewayProxyEventV2) {
  // Get request parameters
  const callsign = event.queryStringParameters?.callsign;
  const zipcode = event.queryStringParameters?.zipcode;

  // Check for callsign parameter
  if (!callsign) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing 'callsign' parameter." }),
    };
  }

  // Check for zipcode parameter
  if (!zipcode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing 'zipcode' parameter." }),
    };
  }

  // Server-side callsign validation
  const callsignRegex = /^(?:[KNWM]|A[A-L]|[KNW][A-Z])[0-9][A-Z]{2,3}$/;
  if (!callsignRegex.test(callsign)) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: "Provided 'callsign' is malformed." }),
    };
  }

  // Server-side zipcode validation
  const zipcodeRegex = /^\d{5}$/;
  if (!zipcodeRegex.test(zipcode)) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: "Provided 'zipcode' is malformed." }),
    };
  }

  // Get EN.dat file - User Data
  let command = new GetObjectCommand({
    Bucket: Resource.DataBucket.name,
    Key: "EN.dat",
  });

  const userDataresponse = await s3.send(command);

  // Check EN.dat - User Data
  if (!userDataresponse.Body) {
    console.error("No EN.dat");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No EN.dat" }),
    };
  }

  // Get HD.dat file - License Data
  command = new GetObjectCommand({
    Bucket: Resource.DataBucket.name,
    Key: "HD.dat",
  });

  const licenseDataresponse = await s3.send(command);

  // Check HD.dat - License Data
  if (!licenseDataresponse.Body) {
    console.error("No HD.dat");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No HD.dat" }),
    };
  }

  // Get AM.dat file - Class Data
  command = new GetObjectCommand({
    Bucket: Resource.DataBucket.name,
    Key: "AM.dat",
  });

  const classDataresponse = await s3.send(command);

  // Check AM.dat - Class Data
  if (!classDataresponse.Body) {
    console.error("No AM.dat");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No AM.dat" }),
    };
  }

  // Get user and license data
  let userData, licenseData, classData;
  userData = await userDataresponse.Body.transformToString();
  licenseData = await licenseDataresponse.Body.transformToString();
  classData = await classDataresponse.Body.transformToString();

  // Split by row
  userData = userData.split("\n");
  licenseData = licenseData.split("\n");
  classData = classData.split("\n");

  // Find row with matching callsign
  let row = 0;
  for (let i = 0; i < userData.length; i++) {
    if (userData[i].match(callsign)) {
      row = i;
      // No break to get the last matching row
    }
  }

  // Find row with matching callsign for class
  // Find row with matching class data. Prefer the Unique System Identifier
  // (USI, field 2 in EN/AM -> index 1) and pick the last matching AM row.
  // If no USI match is found, fall back to matching by callsign (last match).
  const userFields = userData[row].split("|");
  const uniqueId = userFields[1];

  let classRow = 0;
  // Collect AM rows that match the USI
  const usiMatches: number[] = [];
  for (let i = 0; i < classData.length; i++) {
    const fields = classData[i].split("|");
    if (fields[1] === uniqueId) {
      usiMatches.push(i);
    }
  }

  if (usiMatches.length > 0) {
    // Prefer the last USI match (mirrors userData behavior of taking last match)
    classRow = usiMatches[usiMatches.length - 1];
  } else {
    // Fallback: search for callsign and prefer the last occurrence
    for (let i = 0; i < classData.length; i++) {
      const fields = classData[i].split("|");
      if (fields.indexOf(callsign) !== -1) {
        classRow = i;
      }
    }
  }

  // Check if callsign found
  if (row == 0 && callsign != "M0RSE") {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Call sign not found." }),
    };
  }

  // Extract matching user data
  let firstName = userData[row].split("|")[8];
  let lastName = userData[row].split("|")[10];
  let addressZip = userData[row].split("|")[18].substring(0, 5);
  let frn = userData[row].split("|")[22];

  function parseDate(dateStr: string): Date {
    const [month, day, year] = dateStr.split("/").map(Number);
    return new Date(Date.UTC(year, month - 1, day + 1));
  }

  // Extract matching license data
  let grantDate = parseDate(licenseData[row].split("|")[7]);
  let expireDate = parseDate(licenseData[row].split("|")[8]);

  // Extract class data (privileges). Try to find the callsign in the AM row
  // and take the following field as the class. Fall back to common indexes
  // if the callsign isn't present.
  let privileges = "";
  if (classData[classRow]) {
    const fields = classData[classRow].split("|");
    const csIndex = fields.indexOf(callsign);
    if (csIndex !== -1 && fields.length > csIndex + 1) {
      privileges = fields[csIndex + 1];
    } else if (fields[16]) {
      privileges = fields[16];
    } else if (fields[5]) {
      privileges = fields[5];
    }
  }

  // Seeded example, ZIP: 02720
  if (callsign == "M0RSE") {
    firstName = "Samuel";
    lastName = "Morse";
    addressZip = "02720";
    frn = "0123456789";
    grantDate = new Date();
    expireDate = new Date(grantDate.setFullYear(grantDate.getFullYear() + 10));
    privileges = "T";
  }

  // Check if zipcode matches
  if (zipcode != addressZip) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "ZIP code does not match FCC." }),
    };
  }

  let classMap: { [key: string]: string } = {
    T: "Technician",
    G: "General",
    E: "Extra",
    N: "Novice",
    A: "Advanced",
    P: "Technician Plus",
  };

  let id = "";
  let name = firstName + " " + lastName;
  privileges = classMap[privileges] || privileges;

  // Load certificate secrets
  const wwdr = Resource.WWDRCert.value;
  const signerCert = Resource.SignerCert.value;
  const signerKey = Resource.SignerKey.value;

  // Create pass
  const pass = await PKPass.from(
    {
      model: "src/hamradiowallet.pass",
      certificates: {
        wwdr,
        signerCert,
        signerKey,
      },
    },
    {
      serialNumber: frn,
    },
  );

  // Set pass fields
  pass.setExpirationDate(expireDate);

  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: "https://hamradiowallet.com/",
    messageEncoding: "iso-8859-1",
  });

  pass.headerFields.push({
    key: "callsign",
    label: "CALL SIGN",
    value: callsign,
  });

  pass.primaryFields.push({
    key: "name",
    label: "NAME",
    value: name,
  });

  pass.secondaryFields.push({
    key: "privileges",
    label: "PRIVILEGES",
    value: privileges,
  });

  pass.auxiliaryFields.push(
    {
      key: "fcc",
      label: "FCC REGISTRATION NUMBER",
      value: frn,
      row: 0,
    },
    {
      key: "granted",
      label: "GRANT DATE",
      value: grantDate.toISOString(),
      dateStyle: "PKDateStyleLong",
      row: 1,
    },
    {
      key: "expiration",
      label: "EXPIRATION DATE",
      value: expireDate.toISOString(),
      dateStyle: "PKDateStyleLong",
      row: 1,
    },
  );

  // Load pass as buffer
  const buffer = pass.getAsBuffer();

  // Bucket lifecycle
  const lifecycleCommand = new PutBucketLifecycleConfigurationCommand({
    Bucket: Resource.PassBucket.name,
    LifecycleConfiguration: {
      Rules: [
        {
          ID: "Delete objects after 10 minutes",
          Status: "Enabled",
          Filter: {
            Prefix: "",
          },
          Expiration: {
            Days: 1,
          },
          AbortIncompleteMultipartUpload: {
            DaysAfterInitiation: 1,
          },
        },
      ],
    },
  });

  try {
    await s3.send(lifecycleCommand);
  } catch (error) {
    console.error("Error setting bucket lifecycle configuration:", error);
  }

  // Save pass to S3
  id = crypto.randomUUID();
  const putCommand = new PutObjectCommand({
    Key: id + ".pkpass",
    Bucket: Resource.PassBucket.name,
    Body: buffer,
  });

  await s3.send(putCommand);

  // Success
  return {
    statusCode: 200,
    body: JSON.stringify({
      id,
      callsign,
      frn,
      name,
      privileges,
      grantDate,
      expireDate,
    }),
  };
}
