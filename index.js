// create the express server here
require("dotenv").config();
const { PORT = 3000 } = process.env;
const express = require("express");
const server = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

server.use(morgan("dev"));
server.use(bodyParser.json());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(cors());

const client = require("./db/client");

const apiRouter = require("./api");
server.use("/api", apiRouter);

server.get("*", (req, res, next) => {
  res.status(404);
  res.send({ error: "Page not found" });
});

server.use((error, req, res, next) => {
  res.status(500);
  res.send({ error: error.message });
});

server.listen(PORT, () => {
  client.connect();
  console.log("The server is up on port", PORT);
});
/*
require("dotenv").config();
const express = require("express");
const server = express();
const morgan = require("morgan");
const chalk = require("chalk");
const cors = require("cors");
const { PORT = 3000 } = process.env;
const client = require("./db/client");
client.connect();
server.use(cors());
// logging middleware
server.use(morgan("dev"));
// parsing middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
// Serve Docs
const path = require("path");
server.use("/docs", express.static(path.join(__dirname, "public")));
// Router: /api
server.use("/api", require("./api"));
server.get("/", (req, res) => {
  res.redirect("/docs");
});
// 404 handler
server.get("*", (req, res) => {
  res.status(404).send({
    error: "404 - Not Found",
    message: "No route found for the requested URL",
  });
});
// error handling middleware
server.use((error, req, res, next) => {
  console.error("SERVER ERROR: ", error);
  if (res.statusCode < 400) res.status(500);
  res.send({
    error: error.message,
    name: error.name,
    message: error.message,
    table: error.table,
  });
});
server.listen(PORT, () => {
  console.log(
    chalk.blueBright("Server is listening on PORT:"),
    chalk.yellow(PORT),
    chalk.blueBright("Get your routine on!")
  );
});
*/
