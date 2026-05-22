const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyUser = async(req, res, next) => {
  const header = req?.headers.authorization
  console.log(header)
  if (!header) {
    res.status(401).json({ message: 'Unauthorized' })
  }
  const token = header.split(' ')[1]
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' })
  }

  try{
    const { payload } = await jwtVerify(token, JWKS)
    next()
  } catch(error) {
    return res.status(403).json({ message: 'Forbidden' })
  }
}

async function run() {
  try {
    /* await client.connect(); */
    /* await client.db("admin").command({ ping: 1 }); */
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const db = client.db('PetNest');
    const petss = db.collection('pets');
    const petsOrder = db.collection('orders');

    app.get('/pets', verifyUser, async (req, res) => {
      const cursor = petss.find();
      const results = await cursor.toArray();
      res.send(results);
    })

    app.get('/pets/:id', verifyUser, async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const results = await petss.findOne(query);
      res.send(results);
    })

    app.post('/pets', verifyUser, async (req, res) => {
      const listPets = req.body
      const results = await petss.insertOne(listPets).toArray();
      res.json(results);
    })

    app.delete('/pets/:userId', verifyUser, async (req, res) => {
      const { userId } = req.params
      const results = await petss.deleteOne({ userId: userId }).toArray();
      res.json(results);
    })

    app.get('/orders/:userId', verifyUser, async (req, res) => {
      const { userId } = req.params
      const results = await petsOrder.find({ userId: userId }).toArray();
      res.json(results);
    })

    app.post('/orders', verifyUser, async (req, res) => {
      const orderPets = req.body
      const result = await petsOrder.insertOne(orderPets).toArray();
      res.json(result);
    })

    app.delete('/orders/:orderId', verifyUser, async (req, res) => {
      const { orderId } = req.params;
      const result = await petsOrder.deleteOne({ _id: new ObjectId(orderId) }).toArray();
      res.json(result)
    })

  } finally {
    /* await client.close(); */
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Hello world");
})

app.listen(PORT, () => {
  console.log('shamim islam')
})