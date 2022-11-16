const express = require("express");
const compression = require("compression");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 600 } );


const slider = require('./slider');
const popular = require('./popular')
const genre = require('./genres')

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
    myCache.set( "slider", message, 7200 );
    res.json(message);
  }
  else {
    const message = myCache.get( "slider" );
    res.json(message);
  }
});

app.get("/popular", async(req, res) => {
  const { type } = req.query
  value = myCache.get( `popular:${type}` );
  if ( value == undefined ){
    const message = await popular.main(type)
    myCache.set( `popular:${type}`, message, 7200 );
    res.json(message);
  } 
  else {
    const message = myCache.get( `popular:${type}` );
    res.json(message);
  }
});

app.get("/genre/list", async(req, res) => {
  value = myCache.get( "genre/list" );
  if ( value == undefined ){
    const message = await genre.main()
    myCache.set( "genre/list", message, 600 );
    res.json(message);
  }
  else {
    const message = myCache.get( "genre/list" );
    res.json(message);
  }
});

app.listen(5000, () => {
  console.log(`Server start on ${5000}`);
});

// Export the Express API
module.exports = app;