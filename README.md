# Hello World gRPC

Aplikasi klien-server ini terdiri dari 3 files:
1. hello.proto
2. server.js
3. client.js

untuk memulainya, install library yg dibutuhkan terlebih dahulu, 
- @grpc/proto-loader
- grpc
```console
npm install
```

jalankan server:

```console
node server.js
```

buka terminal baru, eksekusi client:
```console
node client.js john
```

# Penjelasan

### File hello.proto
File ini berisi definisi data yang akan digunakan. mirip file json, tapi lebih kecil, lebih cepat, dan lebih sederhana.

```protobuf
syntax = "proto3";
package helloworld;

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply){};
}

message HelloRequest {
  string name = 1;}

message HelloReply {
  string message = 1;
}

```

1. `syntax = "proto3"`
   
   jika definisi ini tidak disertakan, compiler akan berasumsi kamu akan menggunakan [proto2](https://developers.google.com/protocol-buffers/docs/proto)
   
2. `package helloworld;`
    
    nama paket. unik. opsional

3. `service Greeter`

   adalah nama servis yang nantinya akan dipanggil di server & client. Di dalamnya ada definisi sistem RPC (Remote Procedure Call) `SayHello` dengan argumen `HelloRequest` dan mengembalikan response `HelloReply`

4. `message HelloRequest`

   semacam request payload. memiliki satu properti bernama `name` dan bertipe string. angka 1 adalah tag. semacam ID.

5. `message HelloReply`
   
   definisi ini dipakai sebagai acuan saat mengembalikan data (response). memiliki satu properti bernama `message` dan bertipe string. 


Keterangan lebih lengkap bisa dilihat di [Language Guide - proto3](https://developers.google.com/protocol-buffers/docs/proto3)
## File server.js
File ini berfungsi untuk menjalankan server gRPC.

```javascript

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
```

Keterkaitan antara definisi di file `hello.proto` dan `server.js` adalah:
```javascript
server.addService(hello_proto.Greeter.service, {
  sayHello: (call, callback) => {
    callback(null, {message: `Hello ${call.request.name}`});
  }
});
```

penamaan `sayHello` di dalam object, harus sama dengan definisi rpc service yang ada di `hello.proto`. Jika tidak, fungsi `addService` akan mengembalikan pesan error.

## File client.js
File ini berfungsi untuk men-trigger service `sayHello` yang sudah ditambahkan di `server.js`

```javascript
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
  const client = new hello_proto.Greeter('localhost:50051',
                                       grpc.credentials.createInsecure());
  let user;
  if (process.argv.length >= 3) {
    user = process.argv[2];
  } else {
    user = 'world';
  }
  client.sayHello({name: user}, function(err, response) {
    console.log('Greeting:', response.message);
  });
}

main();
```
