import * as cdk from "aws-cdk-lib";
import * as awsAppsync from "aws-cdk-lib/aws-appsync";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

interface AppsyncStackProps extends cdk.StackProps {
  userPool: UserPool;
  createTodoFunc: NodejsFunction;
}

export class AppsyncStack extends cdk.Stack {
  public readonly api: awsAppsync.IGraphqlApi;
  constructor(scope: Construct, id: string, props: AppsyncStackProps) {
    super(scope, id, props);
    this.api = this.createAppsyncApi(props);
    this.createTodoResolver(scope, props, this.api);
  }
  createAppsyncApi(props: AppsyncStackProps) {
    const api = new awsAppsync.GraphqlApi(this, "TodoAppyncApI", {
      name: "TodoAppsyncApi",
      definition: awsAppsync.Definition.fromFile(
        path.join(__dirname, "../graphql/schema.graphql")
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: awsAppsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: awsAppsync.AuthorizationType.IAM,
          },
        ],
      },
      logConfig: {
        fieldLogLevel: awsAppsync.FieldLogLevel.ALL,
      },
    });
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });
    return api;
  }
  createTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.IGraphqlApi
  ) {
    const createTodoResolver = api
      .addLambdaDataSource("CreateTodoDataSource", props.createTodoFunc)
      .createResolver("CreateTodoMutation", {
        typeName: "Mutation",
        fieldName: "createTodo",
      });
  }
}
