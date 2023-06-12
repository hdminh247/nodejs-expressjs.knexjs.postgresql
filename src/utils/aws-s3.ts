import { CloudFront, S3 } from "aws-sdk";
import fs from "fs";
import mime from "mime-types";
import { deleteLocal } from "./file";
import { expiredCloudFrontUrl } from "../constants/file";

const SIGNED_URLS_EXPIRATION_SECONDS = expiredCloudFrontUrl;

const filesUtils = {
  uploadFile: async (
    userId: number,
    storageId: string,
    isPath: boolean,
    file: any,
    fileSize: number,
    callbackUploadProgress = (evt: any) => {},
  ) => {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      useAccelerateEndpoint: true,
    });

    try {
      let data;
      if (isPath) {
        data = fs.createReadStream(file);
      } else {
        // file param is buffer
        data = file;
      }

      const params: any = {
        Bucket: process.env.AWS_BASE_BUCKET || "",
        Key: `files/${userId}/${storageId}`,
        Body: data,
        ContentType: mime.lookup(file) || "",
      };

      // Handle upload progress to S3
      const rs = await s3
        .upload(params)
        .on("httpUploadProgress", (evt) => {
          if (typeof callbackUploadProgress === "function") {
            callbackUploadProgress(evt);
          }
        })
        .promise();

      // Delete file in local when this upload done
      deleteLocal(file);

      return rs;
    } catch (error) {
      console.error({ error });

      // Delete file in local if sth wrong
      deleteLocal(file);
      // @ts-ignore
      throw new Error(error.message);
    }
  },

  getCloudFrontSignedUrl: (userId: number, storageId: string) => {
    const cloudFrontSigner = new CloudFront.Signer(
      process.env.AWS_CLOUDFRONT_KEY_PAIR_ID || "",
      (process.env.AWS_CLOUDFRONT_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    );

    const nowUnix = Math.ceil(new Date().getTime() / 1000);
    const signedParams = {
      url: encodeURI(`${process.env.AWS_CLOUDFRONT_BASE_URL}/files/${userId}/${storageId}`),
      expires: nowUnix + SIGNED_URLS_EXPIRATION_SECONDS,
    };

    return cloudFrontSigner.getSignedUrl(signedParams);
  },
};

export default filesUtils;
