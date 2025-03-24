import SchemaModels from './schema.js';
import mongoose from 'mongoose';

const MongoUri = process.env.LFP_MONGO_URI;
const User = mongoose.model("User", SchemaModels.userSchema);

async function initDatabase() {
  try {
    await mongoose.connect(MongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // 등록된 모델들의 인덱스를 미리 생성 (추후 추가할 모델들도 여기에 포함)
    await Promise.all([
      User.init(),
      // 예: Product.init(), Order.init(), ...
    ]);
    console.log("Indexes ensured");

    // 추후 다른 모델을 추가할 수 있도록 models 객체에 포함
    return { User };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

const Models = {
    User,
};
module.exports = { initDatabase, Models };
