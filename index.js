require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();

// MIDLE WARE
app.use(cors());
app.use(express.json());

// MONGODB
const client = new MongoClient("mongodb://localhost:27017"); //Must have Change URI
client.connect(console.log(`Database Is connected`));

const bohemianDb = client.db("bohemianDB");
const services = bohemianDb.collection("services");

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

// LISTENER
app.listen(process.env.PORT || 5000, () => console.log("Server is Running"));
