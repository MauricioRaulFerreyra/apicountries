const { pool } = require("pg");

const pool = new pool({
  user: "cvtcdieibbycfw",
  host: "ec2-52-21-136-176.compute-1.amazonaws.com",
  database: "de55of37pgg8q9",
  port: 5432,
  password: "374778edac07055641466eaaacc4df5342f533849c76519bf4dccf3923e975b4",
});

module.exports = pool;
