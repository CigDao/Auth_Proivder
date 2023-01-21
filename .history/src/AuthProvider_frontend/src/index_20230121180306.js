import { AuthClient } from "@dfinity/auth-client";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const authClient = await AuthClient.create();

  await authClient.login({
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
    identityProvider:
    onSuccess: async () => {
      handleAuthenticated(authClient);
    },
  });

  const identity = await authClient.getIdentity();
  
});
