import { config } from "dotenv";
import fs from "fs";
import { resolve } from "node:path";
import z from "zod";
import { USERS_MESSAGES } from "./messages";

const ENV_CONFIG = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export const isProduction = () => {
  return envConfig.NODE_ENV === ENV_CONFIG.PRODUCTION;
};

config({
  path: resolve(".env"),
  quiet: true,
});

const checkEnv = () => {
  if (!fs.existsSync(resolve(".env"))) {
    console.error(USERS_MESSAGES.DOTENV_FILE_NOT_FOUND);
    process.exit(1);
  }
};
checkEnv();

const configSchema = z.object({
  PORT: z.coerce.number().default(13337),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  GEMINI_API_BASE_URL: z
    .string()
    .default("https://generativelanguage.googleapis.com/v1beta/models"),
  KEY_COOLDOWN_TIME: z.coerce.number().default(60000),
  MODEL_FETCH_INTERVAL: z.coerce.number().default(3600000),
  INITIAL_MODEL_FETCH_DELAY: z.coerce.number().default(2000),
  DATABASE_URL: z.string(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error(USERS_MESSAGES.DOTENV_FILE_CONFIG_INVALID);
  configServer.error.issues.forEach((issue) => {
    console.error(` - ${issue.path.join(".")}: ${issue.message}`);
  });
  throw new Error(USERS_MESSAGES.DOTENV_CONFIG_ERROR);
}

const envConfig = configServer.data;
export default envConfig;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof configSchema> {}
  }
}
