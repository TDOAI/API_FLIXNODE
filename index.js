const express = require("express");

const app = express();

app.get("/", (req, res) => {
    const message = "YAYYY!!!!!"
    res.send(JSON.stringify(message));
});

app.listen(5000, (err, address) => {
  console.log(`Running on ${address}`);
});

// Export the Express API
module.exports = app;