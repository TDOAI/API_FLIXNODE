const express = require("express");
const compression = require("compression");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 600 } );


const slider = require('./slider');
const popular = require('./popular')

const app = express();
app.use(compression());

app.get("/", (req, res) => {
    const message = "Up & Running!!!!"
    res.json(message);
});

app.get("/slider", async(req, res) => {
  value = myCache.get( "slider" );
  if ( value == undefined ){
    const message = await slider.main()
    myCache.set( "slider", message, 3600 );
    res.json(message);
  }
  else {
    const message = myCache.get( "slider" );
    res.json(message);
  }
});

app.get("/popular", async(req, res) => {
  const { type } = req.query
  const message = await popular.main(type)
  res.json(message);
});

app.listen(5000, () => {
  console.log(`Server start on ${5000}`);
});

// Export the Express API
module.exports = app;