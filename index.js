const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// MONGO DB

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivnezkj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("assignment-12").collection("users");
    const upazilasCollection = client
      .db("assignment-12")
      .collection("upazilas");
    const districtsCollection = client
      .db("assignment-12")
      .collection("districts");
    const donationRequestCollection = client
      .db("assignment-12")
      .collection("donationRequest");
    const blogsCollection = client.db("assignment-12").collection("blogs");

    //   get upazila and district data----------------------------------------------
    app.get("/upazilas", async (req, res) => {
      const result = await upazilasCollection.find().toArray();
      res.send(result);
    });
    app.get("/districts", async (req, res) => {
      const result = await districtsCollection.find().toArray();
      res.send(result);
    });

    // user data---------------------------------------------------------------------
    app.get("/all-users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // block user
    app.patch("/blocked-user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "blocked",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // active user
    app.patch("/active-user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "active",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // volunteer
    app.patch("/users/volunteer/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "volunteer",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      try {
        const usersData = req.body;
        console.log(usersData);
        const result = await usersCollection.insertOne(usersData);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send(error);
      }
    });

    app.patch("/users", async (req, res) => {
      const email = req.query.email;
      const updatedUser = req.body;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
          bloodGroup: updatedUser.bloodGroup,
          photo: updatedUser.photo,
          upazila: updatedUser.upazila,
          district: updatedUser.district,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // donation data
    app.get("/all-donation-request", async (req, res) => {
      const result = await donationRequestCollection.find().toArray();
      res.send(result);
    });
    app.get("/my-donation-request", async (req, res) => {
      try {
        const email = req.query.email;
        console.log(email);
        const query = { requesterEmail: email };
        const result = await donationRequestCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.post("/create-donation-request", async (req, res) => {
      try {
        const donationRequest = req.body;
        console.log(donationRequest);
        const result = await donationRequestCollection.insertOne(
          donationRequest
        );
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send(error);
      }
    });
    app.get("/donation-request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donationRequestCollection.findOne(query);
      res.send(result);
    });
    app.put("/update-donation-request/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          recipientName: item.recipientName,
          bloodGroup: item.bloodGroup,
          recipientDistrict: item.recipientDistrict,
          recipientUpazila: item.recipientUpazila,
          hospitalName: item.hospitalName,
          fullAddress: item.fullAddress,
          donationDate: item.donationDate,
          donationTime: item.donationTime,
          requestMessage: item.requestMessage,
        },
      };
      const result = await donationRequestCollection.updateOne(
        filter,
        updatedDoc
        // options
      );
      console.log(result);
      res.send(result);
    });
    app.delete("/donation-data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donationRequestCollection.deleteOne(query);
      res.send(result);
    });

    // blogs data
    app.get("/all-blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });
    app.delete("/all-blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    });
    app.post("/blogs", async (req, res) => {
      const blogsData = req.body;
      const result = await blogsCollection.insertOne(blogsData);
      res.send(result);
    });
    // publish blog
    app.patch("/publish-blog/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "published",
        },
      };
      const result = await blogsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // unpublish blog
    app.patch("/unpublish-blog/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "draft",
        },
      };
      const result = await blogsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Blood Heros is running");
});

app.listen(port, () => {
  console.log(`Blood Heros is running on port ${port}`);
});

// assignment12
// kmslG0XVIjjLZpem
