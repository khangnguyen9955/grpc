const PROTO_PATH = __dirname + "/grpc_chat.proto";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const grpcChat = protoDescriptor.io.mark.grpc.grpcChat;
const clients = new Map();

function chat(call) {
  console.log("clients");
  console.log(clients.keys());
  call.on("data", function (ChatMessage) {
    user = call.metadata.get("username");
    msg = ChatMessage.message;
    console.log(`${user} text: ${msg}`);
    for (let [msgUser, userCall] of clients) {
      if (msgUser != user) {
        userCall.write({
          from: user,
          message: msg,
        });
      }
    }
    if (clients.get(user) === undefined) {
      clients.set(user, call);
    }
  });
  call.on("end", function () {
    call.write({
      from: "Chat server",
      message: "Nice to see ya! Come back again...",
    });
    call.end();
  });
}

const server = new grpc.Server();
server.addService(grpcChat.ChatService.service, {
  chat: chat,
});
server.bindAsync(
  "0.0.0.0:50050",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server is running on port 50050");
    server.start();
  }
);
