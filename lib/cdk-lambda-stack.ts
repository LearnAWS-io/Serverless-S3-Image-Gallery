import * as cdk from "aws-cdk-lib";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class CdkLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myLambdaFn = new NodejsFunction(this, "my-cdk-lambda-fn", {
      entry: "./lambda/hello-aws.ts",
    });

    const fnUrl = myLambdaFn.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, "function-url", {
      value: fnUrl.url,
    });
  }
}
