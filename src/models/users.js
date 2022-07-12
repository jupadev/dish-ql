import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3
  },
  password: {
    type: String,
    required: true
  },
  friends: [{
    ref: "Persons",
    type: mongoose.Schema.Types.ObjectId
  }]
});

schema.plugin(uniqueValidator);

export default mongoose.model('Users', schema);