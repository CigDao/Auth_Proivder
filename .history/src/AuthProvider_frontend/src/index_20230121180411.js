import { AuthClient } from "@dfinity/auth-client";
 // Your application's name (URI encoded)
 const APPLICATION_NAME = "Your%20Application%20Name";

 // URL to 37x37px logo of your application (URI encoded)
 const APPLICATION_LOGO_URL = "https://nfid.one/icons/favicon-96x96.png";

 const AUTH_PATH = "/authenticate/?applicationName="+APPLICATION_NAME+"&applicationLogo="+APPLICATION_LOGO_URL+"#authorize";

 // Replace https://identity.ic0.app with NFID_AUTH_URL
 // as the identityProvider for authClient.login({}) 
 const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;
 
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const authClient = await AuthClient.create();

  await authClient.login({
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
    identityProvider: NFID_AUTH_URL,
    APPLICATION_LOGO_URL: APPLICATION_LOGO_URL,
    APPLICATION_NAMEL: APPLICATION_NAME,
    onSuccess: async () => {
      handleAuthenticated(authClient);
    },
  });

  const identity = await authClient.getIdentity();
  
});
