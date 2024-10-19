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

  // Check for id parameter
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing 'id' parameter." }),
    };
  }

  let url = "";

  if (id == "Mac OS") {
    // Create the JWT claims
    let claims = {
      iss: Resource.ClientEmail.value,
      aud: "google",
      origins: ["hamradiowallet.com"],
      typ: "savetowallet",
      payload: {
        genericClasses: [
          {
            id: "3388000000022742611.HAMRadioWalletPass",
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
                              fieldPath: "object.textModulesData['frn']",
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
                ],
              },
            },
          },
        ],
        genericObjects: [
          {
            id: "3388000000022742611.N1CPJ2",
            classId: "3388000000022742611.HAMRadioWalletPass",
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
                value: "N1CPJ",
              },
            },
            logo: {
              sourceUri: {
                uri: "https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg",
              },
            },
            textModulesData: [
              {
                id: "name",
                header: "NAME",
                body: "Nicholas Jones",
              },
              {
                id: "privileges",
                header: "PRIVILEGES",
                body: "General",
              },
              {
                id: "frn",
                header: "FRN",
                body: "0123456789",
              },
              {
                id: "expiration_date",
                header: "EXPIRATION DATE",
                body: "August 24, 2024",
              },
            ],
            barcode: {
              type: "QR_CODE",
              value: "https://hamradiowallet.com",
              alternateText: "hamradiowallet.com",
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
  } else {
    // Craft command for S3 get object
    const getCommand = new GetObjectCommand({
      Bucket: Resource.PassBucket.name,
      Key: id + ".pkpass",
    });

    // Get S3 signed URL
    url = await getSignedUrl(s3, getCommand, {
      expiresIn: 600, // 10 minutes
    });
  }
  // Success
  return {
    statusCode: 302, // Temporarily moved
    headers: {
      Location: url,
    },
  };
}
