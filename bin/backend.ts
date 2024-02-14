#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DatabaseStack } from "../stacks/database-stack";
import { ComputeStack } from "../stacks/compute-stack";
import { AuthStack } from "../stacks/auth-stack";
import { AppsyncStack } from "../stacks/appsync-stack";
import { ApiGatewatStack } from "../stacks/apigateway-stack";

const app = new cdk.App();
const databaseStack = new DatabaseStack(app, "DataBaseStack");
const computeStack = new ComputeStack(app, "ComputeStack", {
  usersTable: databaseStack.usersTable,
  todosTable: databaseStack.todosTable,
});
const authStack = new AuthStack(app, "AuthStack", {
  addUserPostConfirmation: computeStack.addUserToTableFunc,
});
const appsyncStack = new AppsyncStack(app, "AppsyncStack", {
  userPool: authStack.todoUserPool,
  createTodoFunc: computeStack.createTodoFunc,
  listTodoFunc: computeStack.listTodoFunc,
  deleteTodoFunc: computeStack.deleteTodoFunc,
  updateTodoFunc: computeStack.updateTodoFunc,
});
const apiGateWayStack = new ApiGatewatStack(app, "ApiGateWayStack", {
  UserPool: authStack.todoUserPool,
  UserPoolClient: authStack.todoUserPoolClient,
  putTodoFunction: computeStack.putTodoFunction,
  getTodoFunctions: computeStack.getTodoFuction,
  updateTodoFunction: computeStack.updateTodoRESTFunction,
  deleteTodoFunction: computeStack.deleteTodoRESTFunction,
});
