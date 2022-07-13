import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface Person {
  name: string;
  phone: string;
  street: string;
  city: string;
}

const schema = new mongoose.Schema<Person>({
  name: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
  },
  phone: {
    type: String,
    minLength: 5,
  },
  street: {
    type: String,
    required: true,
    minLength: 5,
  },
  city: {
    type: String,
    required: true,
    minLength: 3,
  },
});

schema.plugin(uniqueValidator);

export default mongoose.model("Persons", schema);
