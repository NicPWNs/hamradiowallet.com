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
  const callsignRegex = /^(?:[KNW]|A[A-L]|[KNW][A-Z])[0-9][A-Z]{2,3}$/;
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

  // Get EN.dat file
  let command = new GetObjectCommand({
    Bucket: Resource.DataBucket.name,
    Key: "EN.dat",
  });

  const userDataresponse = await s3.send(command);

  // Check EN.dat
  if (!userDataresponse.Body) {
    console.error("No EN.dat");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No EN.dat" }),
    };
  }

  // Get HD.dat file
  command = new GetObjectCommand({
    Bucket: Resource.DataBucket.name,
    Key: "HD.dat",
  });

  const licenseDataresponse = await s3.send(command);

  // Check HD.dat
  if (!licenseDataresponse.Body) {
    console.error("No HD.dat");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No HD.dat" }),
    };
  }

  // Get AM.dat file
  command = new GetObjectCommand({
    Bucket: Resource.DataBucket.name,
    Key: "AM.dat",
  });

  const classDataresponse = await s3.send(command);

  // Check AM.dat
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
    }
  }

  // Find row with matching callsign for class
  let classRow = 0;
  for (let i = 0; i < classData.length; i++) {
    if (classData[i].match(callsign)) {
      classRow = i;
    }
  }

  // Check if callsign found
  if (row == 0) {
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

  // Check if zipcode matches
  if (zipcode != addressZip) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "ZIP code does not match FCC." }),
    };
  }

  // Extract matching license data
  let grantDate = new Date(licenseData[row].split("|")[7]);
  let expireDate = new Date(licenseData[row].split("|")[8]);

  // Extract class data
  let privileges = classData[classRow].split("|")[5];

  let classMap: { [key: string]: string } = {
    T: "Technician",
    G: "General",
    E: "Extra",
    N: "Novice",
    A: "Advanced",
    P: "Technician Plus",
  };

  privileges = classMap[privileges] || privileges;

  // Seeded example, ZIP: 02720
  if (callsign == "M0RSE") {
    firstName = "Samuel";
    lastName = "Morse";
    frn = "0123456789";
    grantDate = new Date();
    expireDate = new Date(grantDate.setFullYear(grantDate.getFullYear() + 10));
  }

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
    }
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
    value: firstName + " " + lastName,
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
    }
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
  const key = crypto.randomUUID();
  const putCommand = new PutObjectCommand({
    Key: key + ".pkpass",
    Bucket: Resource.PassBucket.name,
    Body: buffer,
  });

  await s3.send(putCommand);

  let name = firstName + " " + lastName;

  // Success
  return {
    statusCode: 200,
    body: JSON.stringify({
      key,
      callsign,
      frn,
      name,
      privileges,
      grantDate,
      expireDate,
    }),
  };
}
