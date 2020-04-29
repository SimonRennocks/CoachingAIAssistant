const express = require("express");
const logger = require("morgan");
const routes = require("./routes");

const PORT = process.env.PORT || 4000;

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.use(routes);

app.listen(PORT, () => {
  console.log(`API Server now listening on PORT ${PORT}!`);
});