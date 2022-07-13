import mongoose from "mongoose";

const { MONGODB_URI } = process.env;

mongoose
  .connect(MONGODB_URI as string, {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then((connect) => {
    console.log("🟢 Mongo db connected:", connect.connection.host);
  })
  .catch((err) => {
    console.error("❌ Mongo db connection error", err.message);
  });
