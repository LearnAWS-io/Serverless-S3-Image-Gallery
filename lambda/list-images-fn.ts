import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

const { BUCKET_NAME } = process.env;

const s3Client = new S3Client({});

if (!BUCKET_NAME) {
  throw Error("Missing bucket name in ENV");
}

export const handler: APIGatewayProxyHandlerV2 = async () => {
  const s3ListObjectsCmd = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    // Prefix: "aws-service",
  });
  const s3ObjectListRes = await s3Client.send(s3ListObjectsCmd);

  const presignReqListPromise = s3ObjectListRes?.Contents?.map((item) => {
    const getObjCmd = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: item.Key,
    });
    return getSignedUrl(s3Client, getObjCmd, { expiresIn: 300 });
  });

  if (!presignReqListPromise) {
    throw Error("Failed to create presigned requests");
  }

  const presignReqRes = await Promise.all(presignReqListPromise);

  const imgList = presignReqRes.map(
    (url) => `<img src=${url} width="120" height="120"/>`
  );
  const htmlStr = imgList ? imgList.join("\n") : "<h1>No objects found</h1>";

  return {
    body: htmlStr,
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
  };
};

//@ts-ignore
// handler();
