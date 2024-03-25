const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH'); // Add DELETE here
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const uri = "mongodb+srv://bookstore-server:bookstore@cluster0.m9scipq.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Create a collection of documents
    const bookCollection = client.db("booklist").collection("books");

    // Insert a book to the database
    app.post("/upload-book", async (req, resp) => {
      const data = req.body;
      const result = await bookCollection.insertOne(data);
      resp.send(result);
    });

    //get all books from database
    // app.get("/all-books", async (req, resp) => {
    //   const books = bookCollection.find();
    //   const result = await books.toArray();
    //   resp.send(result);
    // })

    // update a book data
    app.patch("/book/:id", async (req, resp) => {
      const id = req.params.id;
      const updatebookdata = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedoc = {
        $set: {
          ...updatebookdata
        },
      }
      const options = { upsert: true };
      const result = await bookCollection.updateOne(filter, updatedoc, options);
      resp.send(result);
    })

    // to delete a book
    app.delete("/delete-book/:id", async (req, resp) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(filter);
      resp.send(result);
    })
    // filter by category
    //  app.get("/filter-by-category/:category", async (req, resp) => {
    //       const category = req.params.category;
    //       const filter = { category: category };
    //       const result = await bookCollection.find(filter).toArray();
    //       resp.send(result);
    //     })
    app.get("/all-books", async (req, resp) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };

      }
      const result = await bookCollection.find(query).toArray();
      resp.send(result);
    })
//get single book
    app.get("/book/:id", async (req, resp) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(filter);
      resp.send(result);
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
