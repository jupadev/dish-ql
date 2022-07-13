import "dotenv/config";
import { ApolloServer } from "apollo-server";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import "./db";
import Users from "./models/users";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const { JWT_SECRET } = process.env;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  debug: process.env.NODE_ENV !== "production",
  context: async ({ req = {} }) => {
    const auth = req?.headers?.authorization || "";
    const token = auth.split(" ");
    if (auth && token[0].toLowerCase().startsWith("bearer")) {
      const { userId } = jwt.verify(
        auth.split(" ")[1],
        JWT_SECRET as Secret
      ) as JwtPayload;

      const currentUser = await Users.findById(userId).populate("friends");

      return {
        currentUser,
      };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
