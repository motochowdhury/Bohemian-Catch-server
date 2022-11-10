require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();

// MIDLE WARE
app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
  const authtoken = req.headers.authtoken;

  if (!authtoken) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authtoken.split(" ")[1];
  console.log(token);

  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    next();
  });
}

// MONGODB
const uri = `mongodb+srv://motoC:${process.env.MONGO_PASSWORD}@cluster0.wokfd1b.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
client.connect(console.log(`Database Is connected`));

const bohemianDb = client.db("bohemianDB");
const services = bohemianDb.collection("services");
const reviews = bohemianDb.collection("reviews");

// APPLICATION API
app.get("/", (req, res) => {
  res.send("Server is Up");
});

app.get("/jwt", (req, res) => {
  const token = jwt.sign(
    { email: req.params.email },
    process.env.SECRET_ACCESS_TOKEN
  );
  res.send({ token });
});

app.post("/services", async (req, res) => {
  try {
    const result = await services.insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/services", async (req, res) => {
  try {
    const cursor = await services.find({});
    const limitedService = await cursor.limit(3).sort({ date: -1 }).toArray();
    const allService = await services.find({}).toArray();
    res.send({
      allService,
      limitedService,
    });
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/services/:id", async (req, res) => {
  try {
    const query = { _id: ObjectId(req.params.id) };
    const result = await services.findOne(query);
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/reviews", async (req, res) => {
  try {
    const result = await reviews.insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const cursor = reviews.find({ id: req.query.id }).sort({ date: -1 });
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/my-reviews", verifyJwt, async (req, res) => {
  try {
    const cursor = reviews.find({ email: req.query?.email });
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});

app.delete("/delete-review", async (req, res) => {
  try {
    const result = await reviews.deleteOne({ _id: ObjectId(req.query.id) });
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});

app.patch("/update-review", async (req, res) => {
  try {
    const result = await reviews.updateOne(
      { _id: ObjectId(req.query.id) },
      {
        $set: {
          review: req.body.review,
        },
      }
    );
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});

// LISTENER
app.listen(process.env.PORT || 5000, () => console.log("Server is Running"));
