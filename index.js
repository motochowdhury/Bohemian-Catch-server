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
  res.send("Server is Up");
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

app.get("/reviews", async (req, res) => {
  console.log(req.query.id);
  const cursor = reviews.find({ id: req.body.id });
  const result = await cursor.toArray();

  res.send(result);
});
// LISTENER
app.listen(process.env.PORT || 5000, () => console.log("Server is Running"));
