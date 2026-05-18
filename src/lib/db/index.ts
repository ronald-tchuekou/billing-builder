import {neon} from "@neondatabase/serverless";
import {drizzle} from "drizzle-orm/neon-http";
import * as schema from "./schema";
import {serverEnv} from "@/lib/env";

const sql = neon(serverEnv.DATABASE_URL!);

export const db = drizzle(sql, {schema});
export type DB = typeof db;
