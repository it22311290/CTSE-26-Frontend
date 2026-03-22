import client from "./client";

export const healthApi = {
  checkAll: async () => {
    const checks = await Promise.allSettled([
      client.get("/health/user"),
      client.get("/health/product"),
      client.get("/health/order"),
      client.get("/health/payment"),
    ]);
    return {
      user:    checks[0].status === "fulfilled" ? "up" : "down",
      product: checks[1].status === "fulfilled" ? "up" : "down",
      order:   checks[2].status === "fulfilled" ? "up" : "down",
      payment: checks[3].status === "fulfilled" ? "up" : "down",
    } as const;
  },
};
