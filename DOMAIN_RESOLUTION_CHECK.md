# Apex-domain resolution check

**Checked:** 24 August 2026

| Hostname | Public DNS / HTTPS result | Conclusion |
|---|---|---|
| `taxinformation.org` | No IPv4 DNS result; HTTPS request returned `Could not resolve host`; browser returned `ERR_NAME_NOT_RESOLVED`. | The apex has no active DNS resolution. |
| `www.taxinformation.org` | Resolves through `cname.manus.space` to Cloudflare addresses; HTTPS returned `200`; the browser loaded the Tax Return Saathi homepage. | The existing `www` website record remains healthy and must not be changed. |

The managed application configuration contains `www.taxinformation.org` but not the apex hostname. Restoring the apex requires a registrar-level redirect or a separately supported apex DNS/hosting configuration; it is not a frontend application fault.

## Registrar findings

Spaceship states that new URL redirects require **Spaceship DNS**, and its release notes describe custom redirects as a subdomain capability. The affected domain has no apex DNS record at present, while its `www` record is healthy. Therefore, do not replace or delete the existing `www` CNAME. If the registrar does not offer an apex/root forwarding target in its interface, the dependable solution is to move DNS to a provider that supports apex HTTPS redirects (for example, Cloudflare), retain `www → cname.manus.space`, and configure a 301 redirect from the apex to `https://www.taxinformation.org`.

Spaceship explains that DNS record changes may propagate within minutes to a few hours, while nameserver changes can take up to 48 hours. Its Advanced DNS propagation checker can monitor either change.

### Sources

- https://www.spaceship.com/blog/domain-updates/
- https://www.spaceship.com/knowledgebase/dns-propagation-guide/
