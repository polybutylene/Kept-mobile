import { internalQuery } from "../_generated/server";

export const getAnyUserId = internalQuery({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    return user?._id ?? null;
  },
});
