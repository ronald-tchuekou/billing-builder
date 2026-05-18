import {createEnv} from '@t3-oss/env-nextjs'
import z from 'zod'

const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'production']),
    NEXT_PUBLIC_APP_NAME: z.string().default("Billing Builder"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
})

export default env
