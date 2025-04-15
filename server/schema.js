const mongoose=require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  createdAt: { type: Date, default: Date.now },
});

const scenarioSchema = new mongoose.Schema({
  email: { type: String, required: true },
  scenarioPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SchemaModels = { 
  userSchema,
  scenarioSchema 
};

module.exports = { SchemaModels };