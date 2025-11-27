import mongoose from "mongoose";
import { env } from "@/lib/env";

declare global {
  var _mongooseConnection: Promise<typeof mongoose> | undefined;
}

const connectMongo = async () => {
  if (globalThis._mongooseConnection) {
    return globalThis._mongooseConnection;
  }

  globalThis._mongooseConnection = mongoose
    .connect(env.MONGODB_URI, {
      dbName: "selara",
    })
    .then((conn) => {
      return conn;
    })
    .catch((error) => {
      globalThis._mongooseConnection = undefined;
      console.error("Mongo connection failed", error);
      throw error;
    });

  return globalThis._mongooseConnection;
};

export const db = {
  connect: connectMongo,
};

