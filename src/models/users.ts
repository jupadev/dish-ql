import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { Person } from "./persons";

export interface User {
  username: string;
  password: string;
  friends: Person[];
}

const schema = new mongoose.Schema<User>({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
  },
  password: {
    type: String,
    required: true,
  },
  friends: [
    {
      ref: "Persons",
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
});

schema.plugin(uniqueValidator);

export default mongoose.model("Users", schema);
