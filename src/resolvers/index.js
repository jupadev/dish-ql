import { AuthenticationError, UserInputError } from "apollo-server";
import bcrypt from "bcrypt";
import Persons from "../models/persons";
import Users from "../models/users";
import { generateToken } from "../auth";

const resolvers = {
  Query: {
    personCount: () => Persons.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args.phone) {
        const allDocs = await Persons.find();
        return allDocs;
      }
      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;

      const personsFiltered = await Persons.find(byPhone);
      return personsFiltered;
    },
    findPerson: async (root, args) => {
      const person = await Persons.findOne({ name: args.name });
      return person;
    },
    me: async (root, args, context) => {
      return context.currentUser;
    },
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new AuthenticationError("Not Authenticated");
      }

      const newPerson = new Persons({
        ...args,
      });
      try {
        await newPerson.save();
        currentUser.friends = currentUser.friends.concat(newPerson);
        await currentUser.save();
        return newPerson;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    editNumber: async (root, args) => {
      const updatedPerson = await Persons.findOneAndUpdate(
        { name: args.name },
        { phone: args.phone }
      );
      return updatedPerson;
    },
    createUser: async (root, args) => {
      const encryptedPassword = await bcrypt.hash(args.password, 10);
      const user = new Users({
        username: args.username,
        password: encryptedPassword,
      });
      try {
        const token = generateToken(user.id, user.username);
        user.token = token;
        await user.save();
        return user;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    login: async (root, args) => {
      const user = await Users.findOne({
        username: args.username,
      });
      if (!user) {
        throw new UserInputError("Invalid User", {
          invalidArgs: args,
        });
      }
      const isPasswordValid = await bcrypt.compare(
        args.password,
        user.password
      );
      if (isPasswordValid) {
        const token = generateToken(user._id, user.username);
        return { value: token };
      } else {
        throw new UserInputError("Invalid User", {
          invalidArgs: args,
        });
      }
    },
    addAsFriend: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("Not Authenticated");
      }
      const person = await Persons.findOne({ name: args.name });
      if (!person) {
        throw new UserInputError("Person Not Found", {
          invalidArgs: args
        })
      }
      const alreadyFriend = (person) =>
        currentUser.friends.find((p) => p.id === person.id);

      if (!alreadyFriend(person)) {
        currentUser.friends = currentUser.friends.concat(person);
        await currentUser.save();
      }
      return currentUser;
    },
  },
};

export { resolvers };
