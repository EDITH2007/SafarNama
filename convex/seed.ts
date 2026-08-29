import { mutation } from "./_generated/server";
import { ensureUsersSeeded } from "./users";
import { ensureGemsSeeded } from "./gems";
import { ensureDestinationsSeeded } from "./destinations";
import { ensureStaysSeeded } from "./stays";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    await ensureUsersSeeded(ctx.db);
    await ensureGemsSeeded(ctx.db);
    await ensureDestinationsSeeded(ctx.db);
    await ensureStaysSeeded(ctx.db);
  },
});

