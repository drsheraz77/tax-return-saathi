# Tax Return Saathi — Release Handoff

The application is prepared for the managed **Autoscale** runtime. The browser continues to call the same-origin `/api/claude` endpoint, which is now served by the project-managed AI integration; no third-party AI credential is included in client-side source or the Vite output.

## Publish the application

Open the project’s management panel and select **Publish**. The saved release checkpoint is the version to publish. Leave the hosting mode set to **Autoscale**, which is appropriate for the stated low-traffic, intermittent public use case. After publishing, open the published URL and test a normal page load, the Urdu language toggle, and one AI request using non-sensitive sample text.

## Connect `taxinformation.org`

Open **Settings** and then **Domains** in the project management panel. Add `taxinformation.org` as the custom domain. The domain panel will display the current DNS verification record and target value required by the hosting platform; create that **exact** record at the domain’s DNS provider rather than using a guessed IP address or an old record value.

After the DNS record is visible publicly, return to the domain panel and complete verification. Assign the verified domain to the project if the panel prompts for it. HTTPS certificates are then issued and managed by the hosting platform; wait until the domain status shows that HTTPS is active before directing visitors to the custom domain. If you want both `taxinformation.org` and `www.taxinformation.org`, add and verify each hostname and configure the preferred redirect in the domain panel.

## Deployment verification

| Check | Expected result |
| --- | --- |
| `https://taxinformation.org/manifest.webmanifest` | The PWA manifest resolves from the site root. |
| `https://taxinformation.org/sw.js` | The service-worker script resolves from the site root. |
| `https://taxinformation.org/icon-192.png` | The installed-app icon is accessible. |
| AI request from the application | Browser POSTs to `/api/claude`; the server invokes the project-managed AI integration without exposing credentials. |

> Do not add AI credentials to browser-side code, a Vite variable prefixed with `VITE_`, or a public repository. The managed AI credentials are injected only at the server runtime.
