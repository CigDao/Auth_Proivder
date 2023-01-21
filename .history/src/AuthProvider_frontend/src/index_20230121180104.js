import { AuthClient } from "@dfinity/auth-client";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const authClient = await AuthClient.create();

  const button = e.target.querySelector("button");

  const name = document.getElementById("name").value.toString();

  button.setAttribute("disabled", true);

  // Interact with foo actor, calling the greet method
  const greeting = await AuthProvider_backend.greet(name);

  button.removeAttribute("disabled");

  document.getElementById("greeting").innerText = greeting;

  return false;
});