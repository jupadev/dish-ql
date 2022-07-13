declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      MONGODB_URI: string;
      NODE_ENV: "development" | "production";
      PORT?: string;
    }
  }
}
export {};
