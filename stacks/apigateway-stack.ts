import { IUserPool, IUserPoolClient } from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

interface ApiGateWayProps extends cdk.StackProps {
  UserPool: IUserPool;
  UserPoolClient: IUserPoolClient;
  putTodoFunction: IFunction;
  getTodoFunctions: IFunction;
  updateTodoFunction: IFunction;
  deleteTodoFunction: IFunction;
}

export class ApiGatewatStack extends cdk.Stack {
  public readonly TodoApi: apigw2.IHttpApi;
  constructor(scope: Construct, id: string, props: ApiGateWayProps) {
    super(scope, id, props);
    this.TodoApi = this.createTodoHttpApi(scope, props.UserPool);
    const authorizer = new HttpUserPoolAuthorizer(
      "TodoAuthorizer",
      props.UserPool,
      {
        userPoolClients: [props.UserPoolClient],
        identitySource: ["$request.header.Authorization"],
      }
    );
    this.intializeTodoRoutes(scope, props, authorizer);
  }

  createTodoHttpApi(scope: Construct, userpool: IUserPool) {
    const api = new apigw2.HttpApi(this, "TodoHttpAPI", {
      apiName: "TodoHttpAPI",
      corsPreflight: {
        allowHeaders: ["*"],
        allowMethods: [apigw2.CorsHttpMethod.ANY],
        allowOrigins: ["*"],
        maxAge: cdk.Duration.days(10),
      },
      defaultAuthorizer: new HttpUserPoolAuthorizer(
        "TodoUserPoolAuthorizer",
        userpool
      ),
    });
    new cdk.CfnOutput(this, "TODO_HTTP_API_URL", {
      value: api.url!,
    });
    return api;
  }
  getTodoRoute(
    scope: Construct,
    getTodoFunction: IFunction,
    authorizer: HttpUserPoolAuthorizer
  ) {
    const route = new apigw2.HttpRoute(this, "GetTodoRoute", {
      httpApi: this.TodoApi,
      routeKey: apigw2.HttpRouteKey.with("/todo", apigw2.HttpMethod.GET),
      integration: new HttpLambdaIntegration(
        "getTodoIntegration",
        getTodoFunction
      ),
      authorizer,
    });
    return route;
  }
  postTodoRoute(
    scope: Construct,
    putTodoFunction: IFunction,
    authorizer: HttpUserPoolAuthorizer
  ) {
    const route = new apigw2.HttpRoute(this, "PutTodoRoute", {
      httpApi: this.TodoApi,
      routeKey: apigw2.HttpRouteKey.with("/todo", apigw2.HttpMethod.POST),
      integration: new HttpLambdaIntegration(
        "putTodoIntergration",
        putTodoFunction
      ),
      authorizer,
    });
    return route;
  }

  putTodoRoute(
    scope: Construct,
    updateTodoFunction: IFunction,
    authorizer: HttpUserPoolAuthorizer
  ) {
    const route = new apigw2.HttpRoute(this, "UpdateTodoRoute", {
      httpApi: this.TodoApi,
      routeKey: apigw2.HttpRouteKey.with("/todo", apigw2.HttpMethod.PUT),
      integration: new HttpLambdaIntegration(
        "updateTodoIntergration",
        updateTodoFunction
      ),
      authorizer,
    });
    return route;
  }

  deleteTodoRoute(
    scope: Construct,
    deleteTodoFunction: IFunction,
    authorizer: HttpUserPoolAuthorizer
  ) {
    const route = new apigw2.HttpRoute(this, "DeleteTodoRoute", {
      httpApi: this.TodoApi,
      routeKey: apigw2.HttpRouteKey.with("/todo", apigw2.HttpMethod.DELETE),
      integration: new HttpLambdaIntegration(
        "deleteTodoIntergration",
        deleteTodoFunction
      ),
      authorizer,
    });
    return route;
  }

  intializeTodoRoutes(
    scope: Construct,
    props: ApiGateWayProps,
    authorizer: HttpUserPoolAuthorizer
  ) {
    this.getTodoRoute(scope, props.getTodoFunctions, authorizer);
    this.postTodoRoute(scope, props.putTodoFunction, authorizer);
    this.putTodoRoute(scope, props.updateTodoFunction, authorizer);
    this.deleteTodoRoute(scope, props.deleteTodoFunction, authorizer);
  }
}
