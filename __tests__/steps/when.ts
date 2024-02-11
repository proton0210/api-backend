import * as dotenv from "dotenv";
dotenv.config();
import * as cognito from "@aws-sdk/client-cognito-identity-provider";
import { makeGraphQLRequest } from "../utils";

interface CreateTodoInput {
  UserID: string;
  title: string;
}
interface CreateTodoResponse {
  TodoID: string;
  UserID: string;
  title: string;
  completed: boolean;
}
const cognitoClient = new cognito.CognitoIdentityProviderClient({
  region: "ap-south-1",
});

export const a_user_signs_up = async (
  password: string,
  email: string,
  name: string
): Promise<string> => {
  const userPoolId = process.env.ID_USER_POOL;
  const clientId = process.env.CLIENT_USER_POOL_ID;
  const username = email;
  console.log(` [${email}] --> Signing up`);
  const command = new cognito.SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "name", Value: name }],
  });
  const singUpResponse = await cognitoClient.send(command);
  const userSub = singUpResponse.UserSub;
  const adminCommond: cognito.AdminGetUserCommandInput = {
    Username: userSub as string,
    UserPoolId: userPoolId as string,
  };
  await cognitoClient.send(new cognito.AdminConfirmSignUpCommand(adminCommond));
  console.log(`[${email}] --> Confirmed SignUp Up`);

  return userSub as string;
};

export const user_creates_a_todo = async (
  user: any,
  todoData: CreateTodoInput
): Promise<CreateTodoResponse> => {
  const createTodoMutation = `mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      UserID
      TodoID
      title
      completed
    }
  }`;
  const variables = {
    input: todoData,
  };
  let result: any;
  try {
    result = await makeGraphQLRequest(
      createTodoMutation,
      variables,
      user.accessToken
    );
  } catch (error: any) {
    console.log(error);
    throw error;
  }
  console.log(`[ ${user.username}] - Created a TODO`);
  return result.createTodo as CreateTodoResponse;
};
