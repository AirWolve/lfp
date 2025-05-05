const mongoose=require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  createdAt: { type: Date, default: Date.now },
});

const scenarioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: String, required: true },
  scenarioData: { type: mongoose.Schema.Types.Mixed, required: true },
  history_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now }
});

const historySchema = new mongoose.Schema({
  user: { type: String, required: true },
  scenarioName: { type: String, required: true },
  simResult: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SchemaModels = { 
  userSchema,
  scenarioSchema,
  historySchema
};

module.exports = { SchemaModels };