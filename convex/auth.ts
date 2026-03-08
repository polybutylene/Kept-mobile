import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
import { ResendOTPVerification } from "./ResendOTPVerification";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      reset: ResendOTPPasswordReset,
      // verify is intentionally omitted so existing unverified accounts can
      // sign in. Re-enable once Resend domain (kept.systems) is fully
      // verified and tested:
      // verify: ResendOTPVerification,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
});
