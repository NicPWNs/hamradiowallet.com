import { writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import decompress from "decompress";

async function downloadDatabase() {
  const response = await fetch(
    "https://data.fcc.gov/download/pub/uls/complete//l_amat.zip"
  );
  const body = Readable.fromWeb(response.body);
  await writeFile("/tmp/database.zip", body);

  decompress("/tmp/database.zip", "/tmp/data")
    .then((files) => {
      console.log(files);
    })
    .catch((error) => {
      console.log(error);
    });
}

export const handler = async function (event) {
  downloadDatabase();

  return;
};
