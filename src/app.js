const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const routes = require("./routes/index.js");
const cors = require("cors");
require("./db.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/", routes);

app.use('/', (req, res) => {
  res.send('API de países funcionando correctamente');
});

module.exports = app;
