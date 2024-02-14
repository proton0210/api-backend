import * as dotenv from "dotenv";
dotenv.config();
import * as cognito from "@aws-sdk/client-cognito-identity-provider";
import { makeGraphQLRequest, makeRestRequest } from "../utils";

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

export const user_calls_listTodos = async (user: any): Promise<any> => {
  const listTodosQuery = `
  query ListTodos($UserID: ID!) {
    listTodos(UserID: $UserID) {
      UserID
      TodoID
      title
      completed
    }
  }
`;
  const variables = {
    UserID: user.username,
  };

  let result: any;
  try {
    result = await makeGraphQLRequest(
      listTodosQuery,
      variables,
      user.accessToken
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message;
    throw new Error("Error at the time of making graphql request");
  }
  console.log("Result", result);
  return result.listTodos;
};

export const user_calls_deleteTodo = async (
  user: any,
  title: string
): Promise<boolean> => {
  const deleteTodoMutation = `
  mutation DeleteTodo($input: DeleteTodoInput!) {
    deleteTodo(input: $input)
  }
`;
  const variables = {
    input: {
      UserID: user.username,
      title: title,
    },
  };

  let result: any;
  try {
    result = await makeGraphQLRequest(
      deleteTodoMutation,
      variables,
      user.accessToken
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message;
    throw new Error("Error at the time of making graphql request");
  }

  console.log(`[${user.username}] - Deleted a todo`);

  console.log("result ", result);

  return result.deleteTodo;
};

export const user_calls_updateTodo = async (
  user: any,
  title: string
): Promise<boolean> => {
  const updateTodoMutation = `
  mutation UpdateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input)
  }
`;
  const variables = {
    input: {
      UserID: user.username,
      title: title,
    },
  };

  let result: any;
  try {
    result = await makeGraphQLRequest(
      updateTodoMutation,
      variables,
      user.accessToken
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message;
    throw new Error("Error at the time of making graphql request");
  }

  console.log(`[${user.username}] - Updated a todo`);

  console.log("result ", result);

  return result.updateTodo;
};
export const POST_todo_data = async (
  user: any,
  body: Record<string, string>
): Promise<any> => {
  try {
    const response = await makeRestRequest("POST", user.accessToken, body);
    console.log("POST RESPONSE: ", response);
    return response;
  } catch (err: any) {
    console.log("error: ", err);
    throw err;
  }
};

export const GET_todo_data = async (user: any, id: string): Promise<any> => {
  const query = `id=${id}`;
  try {
    const response = await makeRestRequest(
      "GET",
      user.accessToken,
      undefined,
      query
    );
    console.log("GET RESPONSE: ", response);
    return response;
  } catch (err: any) {
    console.log("error: ", err);
    throw err;
  }
};

export const PUT_todo_data = async (
  user: any,
  body: Record<string, string>
): Promise<any> => {
  try {
    const response = await makeRestRequest("PUT", user.accessToken, body);
    console.log("PUT RESPONSE: ", response);
    return response;
  } catch (err: any) {
    console.log("error: ", err);
    throw err;
  }
};

export const DELETE_todo_data = async (
  user: any,
  id: string,
  title: string
): Promise<any> => {
  const query = `id=${id}&title=${title}`;
  try {
    const response = await makeRestRequest(
      "DELETE",
      user.accessToken,
      undefined,
      query
    );
    console.log("DELETE RESPONSE: ", response);
    return response;
  } catch (err: any) {
    console.log("error: ", err);
    throw err;
  }
};
