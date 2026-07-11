import { mutation } from "./_generated/server";
import { ensureUsersSeeded } from "./users";
import { ensureGemsSeeded } from "./gems";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    await ensureUsersSeeded(ctx.db);
    await ensureGemsSeeded(ctx.db);
  },
});
