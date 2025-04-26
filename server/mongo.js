require('dotenv').config();

const mongoose = require('mongoose');
const { SchemaModels } = require('./schema');
const MongoUri = process.env.LFP_MONGO_URI;
const User = mongoose.model("User", SchemaModels.userSchema);
const Scenario = mongoose.model("Scenario", SchemaModels.scenarioSchema);

async function initDatabase() {
  try {
    await mongoose.connect(MongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    await Promise.all([
      User.init(),
      Scenario.init(),
      // example: Product.init(), Order.init(), ...
    ]);
    console.log("Indexes ensured");

    return { User, Scenario };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

const Models = {
    User,
    Scenario
};

module.exports = { initDatabase, Models };