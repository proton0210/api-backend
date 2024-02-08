import * as cdk from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DatabaseStack extends cdk.Stack {
  public readonly usersTable: Table;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.usersTable = new Table(this, "UsersTable", {
      partitionKey: {
        name: "UserID",
        type: AttributeType.STRING,
      },
      tableName: "Users",
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
