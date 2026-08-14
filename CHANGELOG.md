# Changelog

## 2026-08-14

### Docs

- updated the deployment documentation to point at the stable production alias, `closest-wins-elisa-yus-projects.vercel.app`
- recorded the latest immutable production deployment, `closest-wins-lxiqa5qn3-elisa-yus-projects.vercel.app`
- clarified that immutable Vercel deployment URLs are snapshots and should not be treated as the always-current production URL

### Production investigation

- verified that the latest production deployment was created on Friday, August 14, 2026 at 1:52:40 AM PDT
- confirmed that Vercel Authentication is enabled for all `vercel.app` domains except custom domains on the production project
- confirmed that production requests to `/__clerk/v1/environment` and `/__clerk/v1/client` are being redirected into Vercel SSO instead of reaching Clerk normally
- observed that the Clerk publishable key embedded in production resolves to `clerk.closest-wins-36h8ss349-elisa-yus-projects.vercel.app`, which is a deployment-specific hostname rather than the stable production alias
