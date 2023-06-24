import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cdk from "aws-cdk-lib";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class CdkLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myImgGalleryBuck = new Bucket(this, "img-gallery-buck", {
      bucketName: "awsome-imgsss",
    });

    const listImagesFn = new NodejsFunction(this, "my-cdk-lambda-fn", {
      entry: "./lambda/list-images-fn.ts",
      environment: {
        BUCKET_NAME: myImgGalleryBuck.bucketName,
      },
    });

    myImgGalleryBuck.grantRead(listImagesFn);

    const listImgLambdaInteg = new HttpLambdaIntegration(
      "image-list",
      listImagesFn
    );

    const apiGw = new HttpApi(this, "img-gallery-api-gw", {
      apiName: "my-image-gallery",
      // what to do when visiting root - /
      defaultIntegration: listImgLambdaInteg,
    });

    new cdk.CfnOutput(this, "function-url", {
      value: apiGw.url ?? "no url",
    });
  }
}
