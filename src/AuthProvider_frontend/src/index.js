import { Delegation, DelegationChain } from '@dfinity/identity';
import { fromHexString } from '@dfinity/candid/lib/cjs/utils/buffer';

// Your application's name (URI encoded)
const APPLICATION_NAME = "CigSocial";

// URL to 37x37px logo of your application (URI encoded)
const APPLICATION_LOGO_URL = "https://cigdao.org/cigdaologo.png";

const AUTH_PATH = "/authenticate/?applicationName=" + encodeURIComponent(APPLICATION_NAME) + "&applicationLogo=" + encodeURIComponent(APPLICATION_LOGO_URL) + "#authorize";

// Replace https://identity.ic0.app with NFID_AUTH_URL
// as the identityProvider for authClient.login({}) 

const init = async () => {

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const provider = urlParams.get('provider');
	const sessionPublicKey = urlParams.get('sessionPublicKey');
	const callbackUri = urlParams.get('callback_uri');

	let idpWindow;
	let withHash;
	switch (provider) {

		case "NFID":
			withHash = "https://nfid.one" + AUTH_PATH;
			break;
		case "II":
			withHash = "https://identity.ic0.app/#authorize";
			break;
		default:
			withHash = "https://nfid.one" + AUTH_PATH;
	}

	const loginButton = document.getElementById('loginButton');
	const retryButton = document.getElementById('retryButton');
	const tips = document.getElementById('tips');
	const status = document.getElementById('status');

	window.onload = runListener;

	function runListener() {

		idpWindow = window.open(withHash, 'idpWindow');
		loginButton.onclick = () => {
			loginButton.innerText = idpWindow ? 'Redirecting' : 'Login';
			idpWindow = window.open(withHash, 'idpWindow');
		};


		let listener = window.addEventListener('message', function (event) {
			let message = event.data;
			switch (message.kind) {
				case 'authorize-ready': {
					// IDP is ready. Send a message to request authorization.

					let request = {
						kind: 'authorize-client',
						sessionPublicKey: new Uint8Array(fromHexString(sessionPublicKey)),
						maxTimeToLive: undefined,
					};
					status.innerText = 'Authorization Required';
					tips.innerText = 'If this window is not redirecting, please click this button! ';
					loginButton.className = 'primary';
					loginButton.onclick = () => {
						loginButton.innerText = idpWindow ? 'Redirecting' : 'Click me to login';
						idpWindow = window.open(withHash, 'idpWindow');
					};
					retryButton.className = 'hide';
					idpWindow.postMessage(request, withHash);
					break;
				}
				case 'authorize-client-success': {
					idpWindow.close();
					const delegations = message.delegations.map((signedDelegation) => {
						return {
							delegation: new Delegation(
								signedDelegation.delegation.pubkey,
								signedDelegation.delegation.expiration,
								signedDelegation.delegation.targets
							),
							signature: signedDelegation.signature.buffer,
						};
					});
					const delegationChain = DelegationChain.fromDelegations(
						delegations,
						message.userPublicKey.buffer
					);
					const json = JSON.stringify(delegationChain.toJSON());

					window.removeEventListener('message', listener);
					status.innerText = 'Authorization Success';
					tips.innerText = 'If this window is not closed, please click this button! ';
					loginButton.innerText = 'Return To App';
					loginButton.className = 'primary';
					loginButton.onclick = () =>
						(window.location.href = `${callbackUri}?success=true&&json=` + json);
					retryButton.className = 'hide';
					window.location.href = `${callbackUri}?success=true&&json=` + json;
					break;
				}

				case 'authorize-client-failure': {
					idpWindow.close();
					loginButton.style.display = "none";
					retryButton.style.display = "block";
					window.removeEventListener('message', listener);
					status.innerText = 'Authorization Failed';
					tips.innerText = 'Please choose following: ';
					loginButton.onclick = () =>
						(window.location.href = `${callbackUri}?success=false&&json=` + message.text);
					retryButton.className = 'primary';

					retryButton.onclick = () => {
						idpWindow = window.open(withHash, 'idpWindow');
						runListener();
					};
					break;
				}

				default:
					break;
			}
		});
	}
};
init().then(() => {
	const loginButton = document.getElementById('loginButton');
	loginButton.click();
});


