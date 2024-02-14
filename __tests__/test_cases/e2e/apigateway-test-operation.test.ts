import Chance from "chance";
import * as given from "../../steps/given";
import * as when from "../../steps/when";

const chance = new Chance();
describe("Passes all the CRUD Operations ", () => {
  let user: any = null;
  beforeAll(async () => {
    user = (await given.an_authenticated_user()) as any;
  });

  it("Passes API Gateway  operations", async () => {
    const title = chance.sentence({ words: 5 });
    const todoData = {
      id: user.username,
      title: title,
    };
    const postTodoResponse = await when.POST_todo_data(user, todoData);
    expect(postTodoResponse).toMatchObject({
      message: "Todo Created Successfully",
    });

    const getTodoResponse = await when.GET_todo_data(user, user.username);
    const todos = getTodoResponse.todos;
    expect(todos[0].title).toEqual(title);

    const putTodoResponse = await when.PUT_todo_data(user, todoData);
    console.log("putTodoResponse: ", putTodoResponse);
    expect(putTodoResponse).toMatchObject({
      message: "Todo Updated Successfully",
    });
    const deleteTodoResponse = await when.DELETE_todo_data(
      user,
      user.username,
      title
    );
    console.log("deleteTodoResponse: ", deleteTodoResponse);
    expect(deleteTodoResponse).toMatchObject({
      message: "Todo Deleted Successfully",
    });
  });
});
