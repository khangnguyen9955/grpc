const PROTO_PATH = __dirname + "/todo.proto";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;
const text = process.argv[2] || "Default TODO";
const client = new todoPackage.Todo(
  "localhost:4000",
  grpc.credentials.createInsecure()
);

// client.createTodo(
//   {
//     id: -1,
//     text: text,
//   },
//   (err, response) => {
//     console.log(
//       "Received from server after created " + JSON.stringify(response)
//     );
//   }
// );

function createTodo() {
  client.createTodo(
    {
      id: -1,
      text: process.argv[2] || "Default TODO",
    },
    (err, response) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Created todo:", response);
      }
    }
  );
}
/*
client.readTodos(null, (err, response) => {
    console.log("read the todos from server " + JSON.stringify(response))
    if (!response.items)
        response.items.forEach(a=>console.log(a.text));
})
*/

// const call = client.readTodosStream({});
// call.on("data", (item) => {
//   console.log("Streaming....." + JSON.stringify(item));
// });

// call.on("end", () => {
//   console.log("Server done!");
// });

function readTodosStream() {
  const call = client.readTodosStream({});
  call.on("data", (item) => {
    console.log("Streaming....." + JSON.stringify(item));
  });

  call.on("end", () => {
    console.log("Server done!");
  });
}

client.waitForReady(Date.now() + 1000, (err) => {
  if (err) {
    console.error(err);
  } else {
    createTodo();
    readTodosStream();
  }
});
