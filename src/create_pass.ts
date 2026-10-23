import { Resource } from "sst";
import { PKPass } from "passkit-generator";
import { lookupLicensee } from "./lookup";
import { serviceForCallsign, normalizePostal } from "./services";
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

  // Server-side callsign validation. The call sign's format also decides
  // which radio service to look it up in.
  const service = serviceForCallsign(callsign);
  if (!service) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: "Provided 'callsign' is malformed." }),
    };
  }

  // Server-side address code validation. The United States uses a five digit
  // ZIP code and Canada a six character postal code, so the expected format
  // comes from the service.
  const postal = normalizePostal(service, zipcode);
  if (!service.postalRegex.test(postal)) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: "Provided 'zipcode' is malformed." }),
    };
  }

  // Read every file this service publishes from the data bucket. A service
  // whose files the cron job has not stored yet reports that plainly instead
  // of failing as an unexplained server error.
  const files: { [name: string]: string[] } = {};
  for (const name of service.files) {
    try {
      const response = await s3.send(
        new GetObjectCommand({
          Bucket: Resource.DataBucket.name,
          Key: service.prefix + name,
        }),
      );

      if (!response.Body) {
        throw new Error("no body");
      }

      files[name] = (await response.Body.transformToString()).split("\n");
    } catch (error) {
      console.error(`Failed to read ${service.prefix}${name}:`, error);
      return {
        statusCode: 503,
        body: JSON.stringify({
          error: `${service.authority} data is not loaded yet.`,
        }),
      };
    }
  }

  const licensee = lookupLicensee(service, callsign, files);

  // Check if callsign found
  if (!licensee) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Call sign not found." }),
    };
  }

  // ISED publishes no address at all for roughly a quarter of Canadian
  // certificate holders, so there is nothing to check the request against.
  // That is a different answer from the call sign being unknown, and the
  // holder can fix it: ISED rebuilds this file daily.
  if (licensee.postalCodes.length === 0) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: `${service.authority} publishes no ${service.postalLabel.toLowerCase()} for this call sign.`,
      }),
    };
  }

  // Check if the address code matches
  if (!licensee.postalCodes.includes(postal)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: `${service.postalLabel} does not match ${service.authority}.`,
      }),
    };
  }

  const name = licensee.name;

  // Load certificate secrets
  const wwdr = Resource.WWDRCert.value;
  const signerCert = Resource.SignerCert.value;
  const signerKey = Resource.SignerKey.value;

  // Create pass with error handling
  let pass;
  try {
    pass = await PKPass.from(
      {
        model: "src/hamradiowallet.pass",
        certificates: {
          wwdr,
          signerCert,
          signerKey,
        },
      },
      {
        serialNumber: licensee.serialNumber,
        // The model's description covers amateur licenses; other services
        // override it so VoiceOver and Wallet's pass list read correctly.
        description: service.description,
      },
    );
  } catch (error) {
    console.error("Failed to create PKPass:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create pass." }),
    };
  }

  // Set pass fields. A Canadian certificate is issued for life, so leaving
  // the expiration unset is what keeps its pass from ever going stale.
  if (licensee.expireDate) {
    pass.setExpirationDate(licensee.expireDate);
  }

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
    label: service.privilegesLabel,
    value: licensee.privileges,
  });

  // One wide auxiliary row, then two half rows beside each other.
  licensee.aux.forEach((field, index) => {
    const row = index === 0 ? 0 : 1;

    if (field.isoDate) {
      // Apple formats the date itself, for the holder's locale.
      pass.auxiliaryFields.push({
        key: `aux${index}`,
        label: field.label,
        value: field.isoDate,
        dateStyle: "PKDateStyleLong",
        row,
      });
    } else {
      pass.auxiliaryFields.push({
        key: `aux${index}`,
        label: field.label,
        value: field.value,
        row,
      });
    }
  });

  // Load pass as buffer
  let buffer;
  try {
    buffer = pass.getAsBuffer();
  } catch (error) {
    console.error("Failed to generate pass buffer:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate pass." }),
    };
  }

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
  const id = crypto.randomUUID();
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
      name,
      privileges: licensee.privileges,
      privilegesLabel: service.privilegesLabel,
      service: service.id,
      aux: licensee.aux,
      // The site read these before the pass carried generic auxiliary rows.
      // Still sent for the FCC services so a browser running the previous
      // bundle keeps rendering a correct card.
      frn: licensee.serialNumber,
      grantDate: licensee.grantDate,
      expireDate: licensee.expireDate,
    }),
  };
}
