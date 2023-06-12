import fs from "fs";
import axios from "axios";

const parseFileByLine = (data: any) => {
  return data.split(/\r?\n/g);
};

const readFile = (filename: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, { encoding: "utf8" }, (err, data) => {
      if (err) return reject(err);
      resolve(data.trim());
    });
  });
};

export const readFileByLines = async (path: string) => {
  const fileContent = await readFile(path);

  return parseFileByLine(fileContent);
};

export const deleteLocal = (path: string) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    // console.error(err)
  }
};

export const cleanUpFilesDirectory = async () => {
  const directory = "files";

  const directoryFiles = await fs.readdirSync(directory);

  for (const file of directoryFiles) {
    // Input is the directory for uploading file
    if (file !== "input") {
      await fs.unlinkSync(`files/${file}`);
    }
  }
};

export const downloadFile = async (fileUrl: string, outputLocationPath: string, name: string): Promise<any> => {
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  })
    .then((response) => {
      // ensure that the user can call `then()` only when the file has
      // been downloaded entirely.
      const { headers } = response;
      const mimetype = headers["content-type"];
      const size = headers["content-length"];

      let error: any = null;

      return new Promise((resolve, reject) => {
        response.data.pipe(writer);

        writer.on("error", (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on("close", () => {
          if (!error) {
            resolve({
              path: outputLocationPath,
              mimetype,
              size,
              originalname: `${name}`,
            });
          }
          // no need to call the reject here, as it will have been called in the
          // 'error' stream;
        });
      });
    })
    .catch((e) => {
      console.log("DOWNLOAD FILE ERROR");
      console.log(e);

      return new Promise((resolve, reject) => {
        resolve({
          path: outputLocationPath,
          mimetype: null,
          size: 0,
          originalname: name,
        });
      });
    });
};
