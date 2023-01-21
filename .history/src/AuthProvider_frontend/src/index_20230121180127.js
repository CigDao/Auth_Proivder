import { AuthClient } from "@dfinity/auth-client";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const authClient = await AuthClient.create();

  authClient.login({
    // 7 days in nanoseconds
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
    onSuccess: async () => {
      handleAuthenticated(authClient);
    },
  });
});
