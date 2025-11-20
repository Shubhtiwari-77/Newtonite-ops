# TripMate Portfolio

## Development
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
npm run preview
```

## Custom Domain Setup (shubhtiwari.xyz)
This project deploys to GitHub Pages with apex domain `shubhtiwari.xyz`.

### Deployment Flow
GitHub Action at `.github/workflows/deploy.yml` builds and publishes `dist/` with `CNAME` (configured via `cname: shubhtiwari.xyz`).

### Required DNS Records
A (apex):
```
@ 185.199.108.153
@ 185.199.109.153
@ 185.199.110.153
@ 185.199.111.153
```
Optional AAAA (IPv6):
```
@ 2606:50c:8000::153
@ 2606:50c:8001::153
@ 2606:50c:8002::153
@ 2606:50c:8003::153
```
Subdomain:
```
www CNAME Shubhtiwari-77.github.io
```
Use low TTL (300–600) initially for faster propagation.

### Verify DNS
```bash
dig +noall +answer shubhtiwari.xyz
dig @1.1.1.1 shubhtiwari.xyz +noall +answer
dig @8.8.8.8 shubhtiwari.xyz +noall +answer
```

### Build & Verify Domain File
```bash
npm run verify:domain
```
Ensures `dist/CNAME` contains `shubhtiwari.xyz`.

### GitHub Pages
1. Push changes.
2. Settings → Pages: set custom domain `shubhtiwari.xyz`.
3. Wait for SSL certificate; enable *Enforce HTTPS*.

### Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| NXDOMAIN | Missing A records | Add A records at active DNS host |
| Old content | DNS cache | Flush cache / use dig with public resolvers |
| No HTTPS | Cert pending | Wait up to 30 min, then retry |
| Wrong domain | CNAME absent | Keep `CNAME` file in repo root |

### Redirect www → apex
GitHub Pages generally redirects automatically when both apex + www records exist. Otherwise use provider redirect/page rule.

### Script
`scripts/verify-domain-build.js` validates deployment domain.
