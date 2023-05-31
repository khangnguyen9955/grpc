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
const client = new grpcChat.ChatService(
  "localhost:50050",
  grpc.credentials.createInsecure()
);
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const user = process.argv[2];
const metadata = new grpc.Metadata();
metadata.add("username", user);
console.log(metadata);
const call = client.chat(metadata);

call.on("data", function (ChatMessage) {
  console.log(`${ChatMessage.from} ==> ${ChatMessage.message}`);
});
call.on("end", function () {
  console.log("Server ended call");
});
call.on("error", function (e) {
  console.log(e);
});

rl.on("line", function (line) {
  if (line === "quit") {
    call.end();
    rl.close();
  } else {
    call.write({
      message: line,
    });
  }
});

console.log("Enter your messages below:");
