const express = require("express");
const compression = require("compression");


const slider = require('./slider')

const app = express();
app.use(compression());

app.get("/", (req, res) => {
    const message = "Up & Running!!!!"
    res.send(message);
});

app.get("/slider", async(req, res) => {
  const message = await slider.main()
  res.json(message);
});

app.listen(5000, () => {
  console.log(`Server start on ${5000}`);
});

// Export the Express API
module.exports = app;