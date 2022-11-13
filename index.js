const fastify = require("fastify")();

// Initialize Express


// Create GET request
fastify.get("/", (req, res) => {
  res.send("Express on Vercel");
});

// Initialize server
fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
});

module.exports = fastify