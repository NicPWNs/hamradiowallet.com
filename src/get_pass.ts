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
            id: "3388000000022742611.HAMRadioWallet",
            classTemplateInfo: {
              cardTemplateOverride: {
                cardRowTemplateInfos: [
                  {
                    twoItems: {
                      startItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['points']",
                            },
                          ],
                        },
                      },
                      endItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['contacts']",
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
            id: `3388000000022742611.sss`,
            classId: `3388000000022742611.HAMRadioWallet`,
            logo: {
              sourceUri: {
                uri: "https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg",
              },
              contentDescription: {
                defaultValue: {
                  language: "en-US",
                  value: "LOGO_IMAGE_DESCRIPTION",
                },
              },
            },
            cardTitle: {
              defaultValue: {
                language: "en-US",
                value: "[TEST ONLY] Google I/O",
              },
            },
            subheader: {
              defaultValue: {
                language: "en-US",
                value: "Attendee",
              },
            },
            header: {
              defaultValue: {
                language: "en-US",
                value: "Alex McJacobs",
              },
            },
            textModulesData: [
              {
                id: "points",
                header: "POINTS",
                body: "1112",
              },
              {
                id: "contacts",
                header: "CONTACTS",
                body: "79",
              },
            ],
            barcode: {
              type: "QR_CODE",
              value: "BARCODE_VALUE",
              alternateText: "",
            },
            hexBackgroundColor: "#4285f4",
            heroImage: {
              sourceUri: {
                uri: "https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/google-io-hero-demo-only.png",
              },
              contentDescription: {
                defaultValue: {
                  language: "en-US",
                  value: "HERO_IMAGE_DESCRIPTION",
                },
              },
            },
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
