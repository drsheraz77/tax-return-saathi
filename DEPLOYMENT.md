# Tax Return Saathi — Release Handoff

The application is prepared for the managed **Autoscale** runtime. The browser continues to call the same-origin `/api/claude` endpoint, which is now served by the project-managed AI integration; no third-party AI credential is included in client-side source or the Vite output.

## Publish the application

Open the project’s management panel and select **Publish**. The saved release checkpoint is the version to publish. Leave the hosting mode set to **Autoscale**, which is appropriate for the stated low-traffic, intermittent public use case. After publishing, open the published URL and test a normal page load, the Urdu language toggle, and one AI request using non-sensitive sample text.

## Custom-domain status

The active public hostname is `www.taxinformation.org`; it is serving the application successfully over HTTPS. Its registrar record is:

| Type | Host / Name | Target / Value | TTL |
| --- | --- | --- | --- |
| CNAME | `www` | `cname.manus.space` | Auto or 3600 seconds |

### Intentionally parked apex domain

At the owner’s request, the apex hostname `taxinformation.org` is intentionally **parked**. It is not connected to the application, does not have an active redirect to `www`, and does not need a Manus apex-domain record. Visitors should use `https://www.taxinformation.org`.

Do not enable Spaceship’s **URL Redirect** service for this domain. Its interface requires replacing the existing DNS records, which would remove the verified live `www` CNAME. The apex can remain parked unless a future redirect is explicitly required; in that case, use a redirect layer compatible with an existing `www` CNAME, such as a Cloudflare Redirect Rule.

## Deployment verification

| Check | Expected result |
| --- | --- |
| `https://www.taxinformation.org/manifest.webmanifest` | The PWA manifest resolves from the live site root. |
| `https://www.taxinformation.org/sw.js` | The service-worker script resolves from the live site root. |
| `https://www.taxinformation.org/icon-192.png` | The installed-app icon is accessible. |
| AI request from the application | Browser POSTs to `/api/claude`; the server invokes the project-managed AI integration without exposing credentials. |

> Do not add AI credentials to browser-side code, a Vite variable prefixed with `VITE_`, or a public repository. The managed AI credentials are injected only at the server runtime.
