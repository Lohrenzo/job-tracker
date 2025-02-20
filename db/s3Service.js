import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
// import { parseUrl } from "@smithy/url-parser";
// import { formatUrl } from "@aws-sdk/util-format-url";
// import { Hash } from "@smithy/hash-node";
// import { HttpRequest } from "@smithy/protocol-http";

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
  console.log("File: ", file);
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
