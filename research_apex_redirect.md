# Apex Redirect Fallback Research

## Registrar limitation observed

The Spaceship URL Redirect panel displays a mutually exclusive hosting-service choice: using URL Redirect will discard the existing CNAME records. For this project, that would remove the live `www → cname.manus.space` route, so it must not be selected.

## Compatible fallback: Cloudflare

Official Cloudflare documentation describes forwarding an apex hostname to `www` with a 301 rule while retaining the original path and query string. For a redirect-only hostname, Cloudflare requires a proxied DNS record; its documentation gives `192.0.2.1` as the non-origin A-record value that permits redirect processing.

Recommended implementation after moving DNS authority to Cloudflare:

1. Recreate `www` as a proxied CNAME to `cname.manus.space`.
2. Create a proxied A record at `@` pointing to `192.0.2.1`.
3. Add a redirect rule matching host `taxinformation.org`, directing to `https://www.taxinformation.org` with HTTP 301 and preserved query strings; preserve the request path using a dynamic redirect expression.

Sources:

- https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-root-to-www/
- https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/
