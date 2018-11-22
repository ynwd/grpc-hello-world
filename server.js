const PROTO_PATH = `${__dirname}/hello.proto`

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {
    sayHello: (call, callback) => {
      callback(null, {message: `Hello ${call.request.name}`});
    }
  });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
