const mongoose=require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  createdAt: { type: Date, default: Date.now },
});

const SchemaModels = { userSchema };
module.exports = { SchemaModels };