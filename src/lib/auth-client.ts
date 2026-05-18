import {createAuthClient} from "better-auth/react";

import {sentinelClient} from "@better-auth/infra/client";
import {clientEnv} from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
  plugins: [
    sentinelClient()
  ]
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  changePassword,
  resetPassword,
} = authClient;
