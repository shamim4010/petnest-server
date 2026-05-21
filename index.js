const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion} = require('mongodb');
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

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
    const petsOrder = db.collection('orders');

    app.get('/pets', async(req, res) => {
      const cursor = petss.find();
      const results = await cursor.toArray();
      res.send(results);
    })

    app.get('/pets/:id', async(req, res) =>{
        const id = parseInt(req.params.id);
        const query = {id : id};
        const results = await petss.findOne(query);
        res.send(results);
    })

    app.get('/orders/:userId', async(req, res) => {
      const {userId} = req.params
      const results = await petsOrder.find({ userId: userId }).toArray();
      res.json(results)
    })

    app.post('/orders', async(req, res) => {
      const orderPets = req.body
      const result = await petsOrder.insertOne(orderPets).toArray()
      res.json(result);
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