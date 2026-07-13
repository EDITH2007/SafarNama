import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          username: (params.username as string) || (params.name as string),
          isAnonymous: params.isAnonymous === true || (params.isAnonymous as string) === "true",
        };
      },
      validatePasswordRequirements(password) {
        if (!password || password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
      },
    }),
    Google,
  ],
});

