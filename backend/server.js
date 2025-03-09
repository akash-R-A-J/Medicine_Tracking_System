require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { MONGO_URL, PORT } = require("./config");

const manufacturerRouter = require("./routes/manufacturer");
const distributorRouter = require("./routes/distributor");
const hospitalRouter = require("./routes/hospital");
// const storeRouter = require("./routes/store");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));


// custom routes
app.use("/api/v1/manufacturer", manufacturerRouter);
app.use("/api/v1/distributor", distributorRouter);
app.use("/api/v1/hospital", hospitalRouter);
// app.use("/api/v1/store", storeRouter);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
