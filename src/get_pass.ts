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

  // Craft command for S3 get object
  const getCommand = new GetObjectCommand({
    Bucket: Resource.PassBucket.name,
    Key: id + ".pkpass",
  });

  // Get S3 signed URL
  const url = await getSignedUrl(s3, getCommand, {
    expiresIn: 600, // 10 minutes
  });

  // Success
  return {
    statusCode: 302, // Temporarily moved
    headers: {
      Location: url,
    },
  };
}
