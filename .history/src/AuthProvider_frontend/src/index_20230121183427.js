import { Delegation, DelegationChain } from '@dfinity/identity';
import { fromHexString } from '@dfinity/candid/lib/cjs/utils/buffer';
 
// Your application's name (URI encoded)
 const APPLICATION_NAME = "Your%20Application%20Name";

 // URL to 37x37px logo of your application (URI encoded)
 const APPLICATION_LOGO_URL = "https://nfid.one/icons/favicon-96x96.png";

 const AUTH_PATH = "/authenticate/?applicationName="+APPLICATION_NAME+"&applicationLogo="+APPLICATION_LOGO_URL+"#authorize";

 // Replace https://identity.ic0.app with NFID_AUTH_URL
 // as the identityProvider for authClient.login({}) 
 const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;
 
 const init = async () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const sessionPublicKey = urlParams.get('sessionPublicKey');
	const callbackUri = urlParams.get('callback_uri');

	let idpWindow;
	let withHash = NFID_AUTH_URL;

	const loginButton = document.getElementById('loginButton') ;
	const retryButton = document.getElementById('retryButton') ;
	const tips = document.getElementById('tips') ;
	const status = document.getElementById('status') ;

	window.onload = runListener;

	function runListener() {
		setTimeout(() => {
			idpWindow = window.open(withHash, 'idpWindow');
			loginButton.onclick = () => {
				loginButton.innerText = idpWindow ? 'Redirecting' : 'Click me to login';
				idpWindow = window.open(withHash, 'idpWindow');
			};
		}, 1000);

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
					window.removeEventListener('message', listener);
					status.innerText = 'Authorization Failed';
					tips.innerText = 'Please choose following: ';
					loginButton.innerText = 'Return To App';
					loginButton.className = '';
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
window.onload = (event) => {
  console.log("page is fully loaded");
};
init();

