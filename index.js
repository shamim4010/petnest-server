const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion} = require('mongodb');
dotenv.config();
const app = express();

const uri  = process.env.MONGODB_URI;
const PORT = process.env.PORT

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const db = client.db('PetNest');
    const petss = db.collection('pets');
    app.get('/pets', async(req, res) => {
      const cursor = petss.find();
      const results = await cursor.toArray();
      res.send(results);
    })

    app.get(('/pets/:id'), async(req, res) =>{
        const id = parseInt(req.params.id);
        const query = {id : id};
        const results = await petss.findOne(query);
        res.send(results);
    })

  } finally {
    /* await client.close(); */
  }
}
run().catch(console.dir);

app.get('/',(req, res) => {
      res.send("Hello world");
})

app.listen(PORT, () => {
    console.log('shamim islam')
})