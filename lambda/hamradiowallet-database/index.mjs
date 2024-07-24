import AWS from "aws-sdk";
import https from "https";
import {
  createWriteStream,
  createReadStream,
  promises as fsPromises,
} from "fs";
import { pipeline } from "stream/promises";
import unzipper from "unzipper";

// Configure AWS SDK with your credentials and region
const s3 = new AWS.S3({
  region: "us-east-1",
});

// Lambda handler function
export const handler = async (event) => {
  const url = "https://data.fcc.gov/download/pub/uls/complete//l_amat.zip";
  const bucketName = "database.hamradiowallet.com";

  // Download and unzip the ZIP file from the URL
  const downloadAndUnzip = async () => {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download file. Status Code: ${response.statusCode}`
            )
          );
          return;
        }
        const unzipStream = response.pipe(unzipper.Parse());

        unzipStream.on("entry", (entry) => {
          const fileName = entry.path;
          if (fileName === "EN.dat" || fileName === "HD.dat") {
            const filePath = `/tmp/${fileName}`;
            const fileStream = createWriteStream(filePath);
            pipeline(entry, fileStream)
              .then(() => {
                console.log(`Extracted ${fileName}`);
                if (fileName === "HD.dat") {
                  resolve("/tmp"); // Resolve with the directory path after all necessary files are extracted
                }
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            entry.autodrain(); // Skip other files
          }
        });

        unzipStream.on("error", (err) => {
          reject(err);
        });
      });
    });
  };

  try {
    // Download and unzip the ZIP file
    await downloadAndUnzip();

    // Upload the extracted files to S3 bucket
    const file1Path = "/tmp/EN.dat";
    const file2Path = "/tmp/HD.dat";

    // Upload EN.dat
    const file1Stream = createReadStream(file1Path);
    const uploadParams1 = {
      Bucket: bucketName,
      Key: "EN.dat",
      Body: file1Stream,
    };
    const result1 = await s3.upload(uploadParams1).promise();
    console.log(`File uploaded successfully. ETag: ${result1.ETag}`);

    // Upload HD.dat
    const file2Stream = createReadStream(file2Path);
    const uploadParams2 = {
      Bucket: bucketName,
      Key: "HD.dat",
      Body: file2Stream,
    };
    const result2 = await s3.upload(uploadParams2).promise();
    console.log(`File uploaded successfully. ETag: ${result2.ETag}`);

    // Clean up extracted files (optional)
    await fsPromises.unlink(file1Path);
    await fsPromises.unlink(file2Path);

    console.log("Upload and cleanup complete.");
    return { message: "Upload and cleanup complete." };
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};
