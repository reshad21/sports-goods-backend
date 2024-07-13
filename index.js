require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb://localhost:27017`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  // await client.connect();
  try {
    const db = client.db('sportinggoods');
    const productCollection = db.collection('products');

    // app.get('/products', async (req, res) => {
    //   const cursor = productCollection.find({});
    //   const products = await cursor.toArray();
    //   res.send({ status: true, data: products });
    // });

    // -----> our main code for get api
    // app.get('/products', async (req, res) => {
    //   let query = {};
    //   if (req.query.category) {
    //     query.category = req.query.category;
    //   }
    //   // Text search
    //   if (req.query.searchTerm) {
    //     query.$or = [
    //       { title: { $regex: req.query.searchTerm, $options: 'i' } },
    //       { description: { $regex: req.query.searchTerm, $options: 'i' } }
    //     ];
    //   }
    //   const cursor = productCollection.find(query);
    //   const products = await cursor.toArray();
    //   res.send({ status: true, data: products });
    // });

    app.get('/products', async (req, res) => {
      let query = {};

      if (req.query.category) {
        query.category = req.query.category;
      }
      if (req.query.brand) {
        query.brand = req.query.brand;
      }
      if (req.query.rating) {
        query.rating = parseFloat(req.query.rating);
      }
      if (req.query.price) {
        query.price = parseFloat(req.query.price);
      }
      

      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send({ status: true, data: products });
    });



    // ------>GET products by search term
    app.get('/products', async (req, res) => {
      const searchTerm = req.query.searchTerm;
      console.log("backend search query=>",searchTerm);
      if (typeof searchTerm !== 'string') {
        res.status(400).send({ status: false, message: 'Invalid search term' });
        return;
      }

      const query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send({ status: true, data: products });
    });

    app.post('/product', async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.findOne({ _id: ObjectId(id) });
      // console.log(result);
      res.send(result);
    });

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.deleteOne({ _id: ObjectId(id) });
      // console.log(result);
      res.send(result);
    });

    // status update
    app.put('/product/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const product = req.body;
      console.log(product);
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          isCompleted: product.isCompleted,
          title: product.title,
          description: product.description,
          imgurl: product.imgurl,
          category:product.category,
          brand:product.brand,
          quantity:product.quantity,
          rating:product.rating,
          price:product.price,
        },
      };
      const options = { upsert: true };
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
