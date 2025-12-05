require("dotenv").config();
const http = require("http");
const app = require("./index");

let PORT = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(PORT);

server.on("listening", () => {
  console.log("Server running on port", PORT);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is busy! Trying port ${PORT + 1}...`);
    PORT++;
    server.listen(PORT);
  } else {
    console.error(err);
  }
});

