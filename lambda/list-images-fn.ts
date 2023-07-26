import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { readFile } from "fs/promises";
import Handlebars from "handlebars";

const { BUCKET_NAME } = process.env;

const s3Client = new S3Client({});

if (!BUCKET_NAME) {
  throw Error("Missing bucket name in ENV");
}

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

let image_list = null;

if (presignReqListPromise) {
  // throw Error("Failed to create presigned requests");
  const presignReqRes = await Promise.all(presignReqListPromise);

  image_list = presignReqRes.map((url) => {
    const alt = url
      .split("/")[4]
      .split("?")[0]
      .slice(0, -4)
      .replaceAll("-", " ");
    return {
      url,
      alt,
    };
  });
}

const htmlImgTemplate = await readFile("./image-list.html", {
  encoding: "utf8",
});

const template = Handlebars.compile(htmlImgTemplate);

let compiledHtmlStr = "Unable to render HTML";

try {
  compiledHtmlStr = template({
    image_list,
    image_count: s3ObjectListRes.KeyCount,
  });
} catch (err) {
  if (err instanceof Error) {
    compiledHtmlStr = JSON.stringify(err?.message);
  }
}

export const handler: APIGatewayProxyHandlerV2 = async (e) => {
  return {
    body: compiledHtmlStr,
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
  };
};
