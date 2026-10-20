# Cost & Financial Model: Free Tier to Scale

## Architecture Cost Profile
The CloudFix architecture is intentionally engineered to operate **entirely within the free tiers** of managed serverless platforms during prototyping and hackathon evaluation, scaling predictably as concurrent demand grows.

---

## 1. Free-Tier Limits vs Expected 100-User Hackathon Load

| Infrastructure Layer | Free Tier Provider & Ceiling | Expected Usage (100 Concurrent Users / 5,000 Attempts) | Free Tier Utilization (%) | Monthly Cost ($) |
| :--- | :--- | :--- | :--- | :--- |
| **Compute / Frontend Hosting** | **Google Cloud Run**: 2 million requests/month, 360,000 vCPU-seconds, 180 GB-memory-seconds | 500,000 requests, 45,000 vCPU-seconds, 22.5 GB-memory-seconds | **25.0%** of request budget | **$0.00** |
| **Database & Auth (Supabase)** | **Supabase Free Tier**: 500 MB database storage, 50,000 monthly active users (MAU), 500,000 Edge Function invocations | ~15 MB database storage, 500 active users, 50,000 function calls | **3.0%** of storage; **1.0%** of MAU | **$0.00** |
| **Database Connection Pooling** | **Supavisor (Included in Supabase)**: 200 pooled concurrent clients | 100 concurrent clients multiplexed across 30 server connections | **50.0%** of concurrent pooled client limit | **$0.00** |
| **Edge CDN & DDoS Scrubbing** | **Cloudflare Free Plan**: Unlimited clean egress, DDoS protection, edge caching | ~25 GB static asset cache egress | **Negligible** | **$0.00** |
| **CI/CD Quality Gates** | **GitHub Actions**: 2,000 free runner minutes/month | ~180 minutes/month (30 runs × 35 seconds) | **9.0%** of build quota | **$0.00** |
| **Total Baseline Cost** | | | | **$0.00 / month** |

---

## 2. Paid Tier Break-Even Triggers & Cost Escalation Points

When system utilization exceeds the following quantitative thresholds, the platform transitions to predictable paid tiers:

| Break-Even Trigger Event | Quantitative Trigger Metric | Target Paid Tier | Incremental Cost | Action Plan & Architectural Adjustment |
| :--- | :--- | :--- | :--- | :--- |
| **Database Storage Growth** | Database disk usage exceeds **450 MB** (90% of free tier 500 MB) | **Supabase Pro Tier** | +$25.00 / month | Automatically triggers migration from free tier to Pro; grants 8 GB database storage, daily automated backups, and 100,000 MAU. |
| **Concurrency Ceiling** | Sustained concurrent users exceed **250 users** (approaching Supavisor 30-connection limit) | **Compute Scale-Up (Supabase Small Add-on)** | +$10.00 / month | Increases dedicated database vCPU and elevates PostgreSQL `max_connections` from 60 to 120; expands Supavisor pool from 30 to 60. |
| **Container Memory Spike** | Cloud Run memory utilization exceeds **512 MB** per container during peak asset streaming | **Cloud Run Tier Allocation** | ~$12.00 / month | Allocate 1.0 vCPU and 1024 MB memory per instance with maximum 5 instances. |
| **Global Multi-Region Demand** | >35% of traffic originates outside Europe / West Coast with RTT > 150 ms | **Cloudflare Workers KV Edge Caching** | +$5.00 / month | Deploy edge workers to cache scenario metadata globally within 15 ms of international candidates. |

---

## 3. Unit Economics
- **Cost per Completed Diagnostic Scenario Attempt**:
  $$\text{Cost per Attempt} = \frac{\$0.00 \text{ (Free)} \text{ or } \$35.00 \text{ (Pro)}}{10,000 \text{ attempts}} = \$0.0035 \text{ per completed diagnostic scenario}$$
- Compared to traditional real-cloud sandbox provisioning ($0.45 to $1.80 per hour of live cloud VM spin-up), CloudFix's deterministic client-side simulation achieves a **99.2% cost reduction**.
