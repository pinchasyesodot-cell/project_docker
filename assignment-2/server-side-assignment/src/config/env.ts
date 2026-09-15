import "dotenv/config";
import env from "env-var";

export const MONGO_URI = env.get("MONGO_URI").required().asString();
export const PORT = env.get("PORT").required().asPortNumber();