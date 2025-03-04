import jwt from "jsonwebtoken";
import { Resource } from "sst";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Initalize S3 client
const s3 = new S3Client({});

export async function handler(event: APIGatewayProxyEventV2) {
  // Get request parameter
  const id = event.queryStringParameters?.id;
  const callsign = event.queryStringParameters?.callsign;
  const name = event.queryStringParameters?.name;
  const privileges = event.queryStringParameters?.privileges;
  const frn = event.queryStringParameters?.frn;
  const grantDate = event.queryStringParameters?.grantDate;
  const expirationDate = event.queryStringParameters?.expirationDate;
  const os = event.queryStringParameters?.os;

  // Check for id parameter
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing 'id' parameter." }),
    };
  }

  let url = "";

  if (os == "macOS" || os == "iOS") {
    // Craft command for S3 get object
    const getCommand = new GetObjectCommand({
      Bucket: Resource.PassBucket.name,
      Key: id + ".pkpass",
    });

    // Get S3 signed URL
    url = await getSignedUrl(s3, getCommand, {
      expiresIn: 600, // 10 minutes
    });
  } else {
    // Create the JWT claims
    let claims = {
      iss: Resource.ClientEmail.value,
      aud: "google",
      origins: ["hamradiowallet.com"],
      typ: "savetowallet",
      payload: {
        genericClasses: [
          {
            id: "3388000000022742611.HAMRadioWalletClass",
            classTemplateInfo: {
              cardTemplateOverride: {
                cardRowTemplateInfos: [
                  {
                    twoItems: {
                      startItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['name']",
                            },
                          ],
                        },
                      },
                      endItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['privileges']",
                            },
                          ],
                        },
                      },
                    },
                  },
                  {
                    twoItems: {
                      startItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['grant_date']",
                            },
                          ],
                        },
                      },
                      endItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath:
                                "object.textModulesData['expiration_date']",
                            },
                          ],
                        },
                      },
                    },
                  },
                  {
                    oneItem: {
                      item: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['frn']",
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        genericObjects: [
          {
            id: "3388000000022742611." + crypto.randomUUID(),
            classId: "3388000000022742611.HAMRadioWalletClass",
            cardTitle: {
              defaultValue: {
                language: "en-US",
                value: "Radio License",
              },
            },
            subheader: {
              defaultValue: {
                language: "en-US",
                value: "CALL SIGN",
              },
            },
            header: {
              defaultValue: {
                language: "en-US",
                value: callsign,
              },
            },
            logo: {
              sourceUri: {
                uri: "https://raw.githubusercontent.com/NicPWNs/hamradiowallet.com/35e36390f208d23b37d8c74c8c5620003053bdf6/public/International_amateur_radio_symbol.jpg",
              },
            },
            textModulesData: [
              {
                id: "name",
                header: "NAME",
                body: name,
              },
              {
                id: "privileges",
                header: "PRIVILEGES",
                body: privileges,
              },
              {
                id: "grant_date",
                header: "GRANT DATE",
                body: grantDate,
              },
              {
                id: "expiration_date",
                header: "EXPIRATION DATE",
                body: expirationDate,
              },
              {
                id: "frn",
                header: "FCC Registration Number",
                body: frn,
              },
            ],
            barcode: {
              type: "QR_CODE",
              value: "https://hamradiowallet.com",
            },
            hexBackgroundColor: "#ffffff",
          },
        ],
      },
    };

    // The service account credentials are used to sign the JWT
    let token = jwt.sign(claims, Resource.PrivateKey.value, {
      algorithm: "RS256",
    });

    url = `https://pay.google.com/gp/v/save/${token}`;
  }
  // Success
  return {
    statusCode: 302, // Temporarily moved
    headers: {
      Location: url,
    },
  };
}
