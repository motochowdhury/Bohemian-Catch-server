require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const { ObjectID } = require("bson");
const app = express();

// MIDLE WARE
app.use(cors());
app.use(express.json());

// MONGODB
const client = new MongoClient("mongodb://localhost:27017"); //Must have Change URI
client.connect(console.log(`Database Is connected`));

const bohemianDb = client.db("bohemianDB");
const services = bohemianDb.collection("services");
const reviews = bohemianDb.collection("reviews");

// APPLICATION API
app.get("/", (req, res) => {
  console.log(new Date());
  res.send("Server is Up");
});

app.post("/", (req, res) => {
  console.log(req.body);
});

app.post("/services", async (req, res) => {
  try {
    const result = await services.insertOne(req.body);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/services", async (req, res) => {
  try {
    const cursor = await services.find({});
    const limitedService = await cursor.limit(3).toArray();
    const allService = await services.find({}).toArray();
    res.send({
      allService,
      limitedService,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/services/:id", async (req, res) => {
  try {
    const result = await services.findOne({ _id: ObjectID(req.params.id) });
    res.send(result);
  } catch (error) {}
});

app.post("/reviews", async (req, res) => {
  try {
    const result = await reviews.insertOne(req.body);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/reviews", async (req, res) => {
  const cursor = reviews.find({ id: req.query.id }).sort({ date: -1 });
  const result = await cursor.toArray();
  res.send(result);
});

app.get("/my-reviews", async (req, res) => {
  try {
    const cursor = reviews.find({ email: req.query?.email });
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {}
});

app.delete("/delete-review", async (req, res) => {
  try {
    const result = await reviews.deleteOne({ _id: ObjectID(req.query.id) });
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

app.patch("/update-review", async (req, res) => {
  try {
    console.log(req.body);
    const result = await reviews.updateOne(
      { _id: ObjectID(req.query.id) },
      {
        $set: {
          review: req.body.review,
        },
      }
    );

    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

// LISTENER
app.listen(process.env.PORT || 5000, () => console.log("Server is Running"));
