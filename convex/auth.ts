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

  /**
   * Custom user upsert logic.
   *
   * The default Convex auth `store` will crash with
   *   "Update on nonexistent document ID <id>"
   * when an auth `accounts` row still references a `users` row that was
   * manually deleted (e.g. via resetAdminAccount).
   *
   * This callback:
   *  1. Tries to find an existing user by email.
   *  2. If found → patches it in-place (preserves points, role, etc.).
   *  3. If not found → creates a brand-new user document.
   *
   * The returned `_id` is what Convex auth will use going forward, so
   * any dangling account → old-user-id link gets transparently replaced.
   */
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const { profile, existingUserId } = args;

      const email = (profile.email as string | undefined)?.trim().toLowerCase();
      const isAdmin = email === "230107anu@gmail.com";

      // 1. If Convex auth already knows a userId, verify the document exists.
      if (existingUserId) {
        const existing = await ctx.db.get(existingUserId);
        if (existing) {
          // Document is live — patch it and return the same ID.
          await ctx.db.patch(existingUserId, {
            name: (profile.name as string | undefined) || existing.name,
            email: email || existing.email,
            image: (profile.image as string | undefined) ?? existing.image,
            role: isAdmin ? "admin" : (existing.role ?? "user"),
          });
          return existingUserId;
        }
        // Document was deleted — fall through to upsert-by-email below.
      }

      // 2. Try to find an existing user by email.
      if (email) {
        const byEmail = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();

        if (byEmail) {
          // Reuse this document — patch and return its ID.
          await ctx.db.patch(byEmail._id, {
            name: (profile.name as string | undefined) || byEmail.name,
            image: (profile.image as string | undefined) ?? byEmail.image,
            role: isAdmin ? "admin" : (byEmail.role ?? "user"),
          });
          return byEmail._id;
        }
      }

      // 3. No existing user found — create a fresh one.
      return await ctx.db.insert("users", {
        name: (profile.name as string | undefined) ?? email?.split("@")[0] ?? "Traveler",
        email: email,
        image: profile.image as string | undefined,
        role: isAdmin ? "admin" : "user",
        tier: "Bronze",
        totalPoints: 0,
        isVerified: isAdmin,
        isAnonymous: false,
      });
    },
  },
});
