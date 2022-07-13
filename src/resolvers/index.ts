import { AuthenticationError, UserInputError } from "apollo-server";
import bcrypt from "bcrypt";
import Persons, { Person } from "../models/persons";
import Users, { User } from "../models/users";
import { generateToken } from "../auth";
import { HydratedDocument } from "mongoose";

// TODO: improve typing
export const resolvers = {
  Query: {
    personCount: () => Persons.collection.countDocuments(),
    allPersons: async (_: any, args: any) => {
      if (!args.phone) {
        const allDocs = await Persons.find();
        return allDocs;
      }
      const byPhone = (person: HydratedDocument<Person>) =>
        args.phone === "YES" ? person.phone : !person.phone;

      const personsFiltered = await Persons.find(byPhone);
      return personsFiltered;
    },
    findPerson: async (_: any, args: any) => {
      const person = await Persons.findOne({ name: args.name });
      return person;
    },
    me: async (_: any, __: any, context: any) => {
      return context.currentUser;
    },
  },
  Person: {
    address: (root: Pick<Person, "street" | "city">) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
  Mutation: {
    addPerson: async (_: any, args: Person, context: any) => {
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
        throw new UserInputError((error as Error).message, {
          invalidArgs: args,
        });
      }
    },
    editNumber: async (_: any, args: any) => {
      const updatedPerson = await Persons.findOneAndUpdate(
        { name: args.name },
        { phone: args.phone }
      );
      return updatedPerson;
    },
    createUser: async (_: any, args: any) => {
      const encryptedPassword = await bcrypt.hash(args.password, 10);
      const user: any = new Users({
        username: args.username,
        password: encryptedPassword,
      });
      try {
        const token = generateToken(user.id, user.username);
        user.token = token;
        await user.save();
        return user;
      } catch (error) {
        throw new UserInputError((error as Error).message, {
          invalidArgs: args,
        });
      }
    },
    login: async (_: any, args: any) => {
      const user: any = await Users.findOne({
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
    addAsFriend: async (_: any, args: any, { currentUser }: any) => {
      if (!currentUser) {
        throw new AuthenticationError("Not Authenticated");
      }
      const person = await Persons.findOne({ name: args.name });
      if (!person) {
        throw new UserInputError("Person Not Found", {
          invalidArgs: args,
        });
      }
      const alreadyFriend = (person: HydratedDocument<Person>) =>
        currentUser.friends.find((p: any) => p.id === person.id);

      if (!alreadyFriend(person)) {
        currentUser.friends = currentUser.friends.concat(person);
        await currentUser.save();
      }
      return currentUser;
    },
  },
};
