import { Resource } from "sst";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
var AdmZip = require("adm-zip");

const client = new S3Client({});

export async function handler() {
  try {
    var url = "https://data.fcc.gov/download/pub/uls/complete/l_amat.zip";

    const filesToKeep = ["EN.dat", "HD.dat", "AM.dat"];
    const bucketName = Resource.DataBucket.name;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const zipBuffer = Buffer.from(await response.arrayBuffer());

    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
      if (filesToKeep.includes(entry.entryName)) {
        const fileContent = zip.readFile(entry);

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: entry.entryName,
          Body: fileContent,
        });

        await client.send(command);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Files processed and uploaded successfully.",
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An error occurred during processing." }),
    };
  }
}
