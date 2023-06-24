import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
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

  const objectLi = s3ObjectListRes?.Contents?.map(
    (item) => `<li>${item.Key}</li>`
  );
  const htmlStr = objectLi
    ? `<ul>
  ${objectLi.join("\n")}
</ul>
`
    : "<h1>No objects found</h1>";

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
