const express = require("express");
const logger = require("morgan");

const PORT = process.env.PORT || 4000;

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// routes
app.use(require("./routes/api.js"));
//app.use(require("./routes/view.js"));

app.listen(PORT, () => {
  console.log(`API Server now listening on PORT ${PORT}!`);
});