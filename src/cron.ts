import { Resource } from "sst";
import { SERVICES } from "./services";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
let AdmZip = require("adm-zip");

const client = new S3Client({});

export async function handler() {
  const bucketName = Resource.DataBucket.name;

  try {
    // Pull each service's archive one at a time. They are large (the amateur
    // one is ~200 MB compressed), so holding only one in memory at a time
    // keeps the job inside its memory limit.
    for (const service of SERVICES) {
      const response = await fetch(service.url);
      if (!response.ok) {
        console.log("HTTP error! status:", response.status, service.url);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const zipBuffer = Buffer.from(await response.arrayBuffer());
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        if (service.files.includes(entry.entryName)) {
          const fileContent = zip.readFile(entry);

          const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: service.prefix + entry.entryName,
            Body: fileContent,
          });

          await client.send(command);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Files processed and uploaded successfully.",
      }),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred during processing.",
        error: message,
      }),
    };
  }
}
