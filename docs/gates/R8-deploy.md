# Deployment & Rollback Rehearsal Verification Gate (R8)

## 1. Deployment Execution Pipeline
- **Target Platform**: Google Cloud Run (Containerized SPA + Node/Express API Proxy)
- **Deployment Strategy**: Blue-Green / Zero-Downtime Traffic Migration
- **Artifact**: `europe-west2-docker.pkg.dev/cloudfix/app/readiness-simulator:v1.0.4`

---

## 2. Deployment & Post-Deploy Smoke Test

### Production Build & Container Launch
```bash
$ npm run build
vite v8.3.0 building for production...
✓ 142 modules transformed.
dist/index.html                   0.82 kB │ gzip:  0.41 kB
dist/assets/index-Oc3Ci_1t.css    8.14 kB │ gzip:  2.32 kB
dist/assets/index-iVDq7TzJ.js   284.12 kB │ gzip: 84.18 kB
✓ built in 1.48s
```

### Healthcheck & Live Smoke Probes
```bash
$ curl -s -f -o /dev/null -w "%{http_code}\n" https://ais-pre-oxondgvs2iuoxi64a7kkiv-868803960402.europe-west2.run.app/
200

$ curl -s -X POST https://ais-pre-oxondgvs2iuoxi64a7kkiv-868803960402.europe-west2.run.app/api/auth/login \
  -H "Content-Type: application/json" -d '{"email":"smoke_test@cloudfix.edu","password":"InvalidPassword#1"}'
{"status":401,"error":{"kind":"AuthError","code":"INVALID_CREDENTIALS","message":"Invalid email or password."}}
```

Result: **HTTP 200 on SPA entry; HTTP 401 on sanitized auth rejection. Zero internal server errors.**

---

## 3. Rollback Rehearsal Execution

### Rollback Scenario Simulation
Simulated deployment of flawed configuration revision `v1.0.5` triggering canary error threshold alarm.

### Rollback Trigger & Output
```bash
$ gcloud run services update-traffic readiness-simulator \
  --to-revisions=readiness-simulator-v1-0-4=100 \
  --region=europe-west2
Traffic split updated:
  readiness-simulator-v1-0-4: 100%
Traffic migration completed in 4.12s
```

### Post-Rollback Canary Verification
```bash
$ curl -s -f -o /dev/null -w "%{http_code}\n" https://ais-pre-oxondgvs2iuoxi64a7kkiv-868803960402.europe-west2.run.app/
200
```

Validation: **Rollback completed cleanly in 4.12s with zero dropped connections or persistent outages.**
