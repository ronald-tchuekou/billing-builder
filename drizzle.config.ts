import "dotenv/config";
import type {Config} from "drizzle-kit";
import {serverEnv} from "@/lib/env";

export default {
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
