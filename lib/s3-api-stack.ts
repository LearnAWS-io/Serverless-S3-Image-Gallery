import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class S3ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // import the bucket instead of creating
    const myImgGalleryBuck = Bucket.fromBucketName(
      this,
      "img-gallery-buck",
      "awsome-imgsss"
    );

    const listImagesFn = new NodejsFunction(this, "list-images-fn", {
      entry: "./lambda/list-images-fn.ts",
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        format: OutputFormat.ESM,
        commandHooks: {
          beforeBundling(): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`cp -r ${inputDir}/lambda/image-list.html ${outputDir}/`];
          },
          beforeInstall() {
            return [];
          },
        },
      },

      environment: {
        BUCKET_NAME: myImgGalleryBuck.bucketName,
      },
    });

    myImgGalleryBuck.grantRead(listImagesFn);

    // create HTTP APIs
    const listImgLambdaInteg = new HttpLambdaIntegration(
      "image-list",
      listImagesFn
    );

    const apiGw = new HttpApi(this, "img-gallery-api-gw", {
      apiName: "my-image-gallery",
      // what to do when visiting root - /
      defaultIntegration: listImgLambdaInteg,
    });

    new CfnOutput(this, "function-url", {
      value: apiGw.url ?? "no url",
    });
  }
}
