# Disaster Recovery Runbook: Database Restoration & Failover

## Operational Objectives
- **Recovery Point Objective (RPO)**: **≤ 1.0 hour** (Continuous WAL streaming + nightly pg_dump snapshots)
- **Recovery Time Objective (RTO)**: **≤ 15.0 minutes (900 seconds)** (Automated snapshot download and parallel restore)

---

## 1. Incident Severity Classification & Trigger Conditions
A Disaster Recovery restoration is initiated upon confirmation of:
1. **Primary Database Corruption**: Unrecoverable data disk block corruption or accidental truncation.
2. **Cloud Region Outage**: Total failure of primary cloud region lasting > 10 minutes with no ETA.
3. **Malicious / Unauthorized Deletion**: RLS policy bypass resulting in compromised data records.

---

## 2. Emergency Restoration Procedure

### Step 1: Identify Latest Valid Backup Archive (00:00 - 02:00)
```bash
# List latest encrypted backup archives in cloud storage
gcloud storage ls --long gs://cloudfix-db-backups-europe-west2/backup_cloudfix_*.sql.gz | tail -n 5

# Download latest verified snapshot
LATEST_BACKUP=$(gcloud storage ls gs://cloudfix-db-backups-europe-west2/backup_cloudfix_*.sql.gz | tail -n 1)
gcloud storage cp "${LATEST_BACKUP}" ./latest_restore.sql.gz
```

### Step 2: Provision Fresh Target PostgreSQL Instance (02:00 - 06:00)
```bash
# Provision clean PostgreSQL 15+ target via Terraform or Supabase CLI
supabase db start --clean

# Verify connection pooler connectivity
pg_isready -h "${RESTORE_DB_HOST}" -p 6543 -U postgres
```

### Step 3: Decompress and Stream Database Restore (06:00 - 11:00)
```bash
# Stream parallel decompression directly into target database
gunzip -c ./latest_restore.sql.gz | psql \
  -h "${RESTORE_DB_HOST}" \
  -p 6543 \
  -U postgres \
  -d postgres \
  --single-transaction \
  --set ON_ERROR_STOP=on
```

### Step 4: Validate RLS Security & Seed Invariants (11:00 - 13:00)
```bash
# Run automated acceptance gate checks
npx tsx supabase/tests/rls-multiuser.ts
npx tsx supabase/tests/retention.ts

# Confirm 50+ questions and active domains
psql -h "${RESTORE_DB_HOST}" -p 6543 -U postgres -d postgres -c \
  "SELECT count(*) AS total_questions FROM questions; SELECT count(*) AS active_domains FROM question_domains;"
```

### Step 5: Shift Cloud Run Compute Traffic to Restored Instance (13:00 - 14:30)
```bash
# Update Cloud Run service environment secrets to point to restored database
gcloud run services update cloudfix-app \
  --update-secrets="SUPABASE_DB_HOST=secret-restore-db-host:latest,SUPABASE_ANON_KEY=secret-anon-key:latest" \
  --region=europe-west2

# Verify application health check
curl -f https://cloudfix-app.run.app/health
```

---

## 3. Post-Restoration Proctor & Candidate Communication
1. Notify active proctors via status channel that database restoration completed within RTO budget.
2. Invalidate stale client local storage sessions to force clean JWT re-authentication.
3. Archive root-cause post-mortem incident report within 24 hours.
