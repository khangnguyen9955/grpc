const PROTO_PATH = __dirname + "/todo.proto";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;
// const server = new grpc.Server();
const fs = require("fs");

// Read the todos from a file, or create a new file if it does not exist
let todos = [];
if (fs.existsSync("todos.json")) {
  try {
    todos = JSON.parse(fs.readFileSync("todos.json", { encoding: "utf-8" }));
  } catch (e) {
    console.error(e);
  }
} else {
  // Initialize with default values
  todos = [
    { id: 1, text: "Make coffee" },
    { id: 2, text: "Feed the cat" },
    { id: 3, text: "Do laundry" },
  ];
  fs.writeFileSync("todos.json", JSON.stringify(todos), { encoding: "utf-8" });
}
console.log("Loaded todos:", todos);
function saveTodos() {
  fs.writeFileSync("todos.json", JSON.stringify(todos), {
    encoding: "utf-8",
  });
}

function createTodo(call, callback) {
  const todoItem = {
    id: todos.length + 1,
    text: call.request.text,
  };
  todos.push(todoItem);
  saveTodos();

  callback(null, todoItem);
}

// function readTodosStream(call, callback) {
//   console.log("readTodosStream");
//   todos.forEach((t) => call.write(t));
// // call.end();
// }
function readTodosStream(call) {
  console.log("readTodosStream");

  let i = 0;
  const intervalId = setInterval(() => {
    call.write(todos[i]);
    i++;
    if (i == todos.length) {
      clearInterval(intervalId);
    }
  }, 100);
}

function readTodos(call, callback) {
  callback(null, { items: todos });
}

function getServer() {
  let server = new grpc.Server();
  server.addService(todoPackage.Todo.service, {
    createTodo: createTodo,
    readTodos: readTodos,
    readTodosStream: readTodosStream,
  });
  return server;
}
let routeServer = getServer();
routeServer.bindAsync(
  "0.0.0.0:4000",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server is running on port 4000");
    routeServer.start();
  }
);
