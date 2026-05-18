import {createEnv} from '@t3-oss/env-nextjs'
import {z} from 'zod'

const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(16),
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_API_KEY: z.string().min(32),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_SECURE: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production']),
  },
  experimental__runtimeEnv: process.env,
})

export default env
