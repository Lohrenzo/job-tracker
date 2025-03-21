// import { parseUrl } from "@smithy/url-parser";
// import { formatUrl } from "@aws-sdk/util-format-url";
// import { Hash } from "@smithy/hash-node";
// import { HttpRequest } from "@smithy/protocol-http";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();
// A region and credentials can be declared explicitly. For example
// `new S3Client({ region: 'us-east-1', credentials: {...} })` would
//initialize the client with those settings. However, the SDK will
// use your local configuration and credentials if those properties
// are not defined here.
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export async function s3Upload(file, folder, username) {
  // console.log("File: ", file);
  const fileKey = `uploads/${folder}/${username}/${Date.now()}-${
    file.originalname
  }`;

  // Put an object into an Amazon S3 bucket.
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype, // Ensure correct file type
    })
  );

  return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
}

export async function s3View(fileName) {
  // Read the object.
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.BUCKETNAME,
      Key: `uploads/${fileName}`,
    })
  );

  return Body;
}

// Delete an object from an S3 bucket
export async function s3Delete(fileUrl) {
  try {
    // Extract the file key from the URL
    const fileKey = fileUrl.split(".amazonaws.com/")[1];

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: fileKey,
      })
    );

    console.log(`Deleted file from S3: ${fileKey}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}
