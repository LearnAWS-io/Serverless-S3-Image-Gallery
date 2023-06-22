import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  return {
    body: "Hello to LearnAWS.io students",
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
  };
};
