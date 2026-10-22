/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Flashcard {
  readonly id: string;
  readonly domainId: 'DOM-CONCEPTS' | 'DOM-SERVICES' | 'DOM-SECURITY';
  readonly domainTitle: string;
  readonly term: string;
  readonly category: string;
  readonly definition: string;
  readonly keyDetails: readonly string[];
  readonly examTip: string;
  readonly commonPitfall?: string;
  readonly scenarioNote?: string;
}

export interface FlashcardStats {
  readonly totalCards: number;
  readonly masteredCards: number;
  readonly masteredPercentage: number;
  readonly domainBreakdown: readonly {
    readonly domainId: string;
    readonly domainTitle: string;
    readonly total: number;
    readonly mastered: number;
    readonly percentage: number;
  }[];
}

const STORAGE_KEY = 'cloudfix_az900_flashcard_mastery_v1';

/**
 * 40 High-Yield Synthetic AZ-900 Flashcards
 * Covering Cloud Concepts, Azure Architecture & Services, and Security & Pricing.
 * Strictly compliant with fair use & educational pedagogy.
 */
export const AZ900_FLASHCARD_DECK: readonly Flashcard[] = [
  // =========================================================================
  // DOMAIN 1: CLOUD CONCEPTS (13 CARDS)
  // =========================================================================
  {
    id: 'FC-01',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Models',
    term: 'IaaS (Infrastructure as a Service)',
    definition: 'Cloud service category where the cloud provider manages physical hardware, virtualization, and networking, while the customer manages the operating system, middleware, runtime, data, and applications.',
    keyDetails: [
      'Customer controls OS configuration, software patches, and firewall rules',
      'Maximum administrative control and configuration flexibility',
      'Examples: Azure Virtual Machines, Virtual Networks, Azure Disks',
    ],
    examTip: 'Whenever a question mentions migrating existing VMs with minimal architectural rewrite (lift-and-shift), IaaS is almost always the answer.',
    commonPitfall: 'Do not confuse IaaS with PaaS; in IaaS, the customer MUST apply OS security patches.',
    scenarioNote: 'Contoso Health operates legacy radiological imaging software requiring direct OS kernel access and custom file drivers. Migrating to Azure Virtual Machines (IaaS) allows them to retain complete OS control while retiring on-prem physical server racks.',
  },
  {
    id: 'FC-02',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Models',
    term: 'PaaS (Platform as a Service)',
    definition: 'Cloud service category where the cloud provider manages hardware, networking, and the operating system/runtime, allowing customers to focus strictly on building and deploying application code and data.',
    keyDetails: [
      'Zero OS patch management or server provisioning for the customer',
      'Built-in automated scaling, high availability, and SSL management',
      'Examples: Azure App Service, Azure SQL Database, Azure Functions',
    ],
    examTip: 'Look for phrases like "focus solely on app logic without managing virtual machines or operating systems".',
    commonPitfall: 'PaaS does not give you remote desktop (RDP) or root shell access to the underlying OS.',
    scenarioNote: 'Fabrikam Global Logistics builds a mobile package-tracking portal using Azure App Service and Azure SQL Database. The development team deploys code directly via CI/CD with zero server patching or OS maintenance overhead.',
  },
  {
    id: 'FC-03',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Models',
    term: 'SaaS (Software as a Service)',
    definition: 'End-user application centrally hosted and managed by the cloud provider, accessed over the web browser or mobile client on a subscription basis.',
    keyDetails: [
      'Cloud provider handles all infrastructure, runtime, code updates, and availability',
      'Customer only configures user access, identities, and their own data',
      'Examples: Microsoft 365, Dynamics 365, Outlook on the web',
    ],
    examTip: 'Think "ready-to-use software product". The customer configures nothing lower than user settings and data.',
    scenarioNote: 'Tailspin Toys equips 5,000 branch store associates with Microsoft 365 and Dynamics 365 on an annual per-seat subscription. IT manages account roles and data sharing without maintaining mail servers or database runtimes.',
  },
  {
    id: 'FC-04',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Economics',
    term: 'CapEx vs. OpEx',
    definition: 'CapEx (Capital Expenditure) requires large upfront capital investment in physical hardware/datacenters; OpEx (Operational Expenditure) spends on ongoing operational services billed by actual consumption.',
    keyDetails: [
      'CapEx: High initial expense, deducted via depreciation over years',
      'OpEx: Zero initial hardware expense, deducted as operating expense in the current tax year',
      'Cloud computing transforms CapEx into predictable, scalable OpEx',
    ],
    examTip: 'A company wanting to avoid purchasing physical server hardware up front chooses the consumption-based OpEx model.',
    scenarioNote: 'Adatum Financial faced a $2.8M capital requisition for aging SAN storage and blade servers. By pivoting to Azure consumption-based OpEx, they eliminated the upfront capital outlay and shifted expenses into predictable monthly operational budgets.',
  },
  {
    id: 'FC-05',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Economics',
    term: 'Consumption-Based Model',
    definition: 'Pricing structure where customers only pay for the cloud computing, storage, and networking resources they actively consume, with no upfront procurement costs or termination fees.',
    keyDetails: [
      'Cost directly reflects demand spikes and valleys',
      'No fees incurred when resources are deallocated or stopped',
      'Includes per-second billing for compute and per-GB storage pricing',
    ],
    examTip: 'Contrast with traditional on-premises datacenters where you pay for peak capacity 24/7 regardless of actual utilization.',
    scenarioNote: 'Woodgrove Bank executes overnight Monte Carlo portfolio risk simulations for 3 hours each evening. Under Azure consumption pricing, 64 compute instances run for 180 minutes and are shut down, costing $42 per night instead of $18,000 monthly for idle on-prem hardware.',
  },
  {
    id: 'FC-06',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Benefits',
    term: 'Scalability (Vertical vs. Horizontal)',
    definition: 'The ability of a system to accommodate growing workload demands by either adding more power to existing resources (Vertical / Scale Up) or adding more instances of resources (Horizontal / Scale Out).',
    keyDetails: [
      'Scale Up (Vertical): Adding more CPU cores or RAM to an existing VM',
      'Scale Out (Horizontal): Adding additional VM instances behind a load balancer',
      'Scale In / Scale Down: Reducing resources when demand decreases',
    ],
    examTip: 'Scale Out enables near-limitless scaling and zero-downtime additions; Scale Up usually requires a brief restart to resize a VM.',
    scenarioNote: 'Northwind Traders scales up their primary reporting VM from 4 vCPUs to 16 vCPUs (vertical) for month-end reconciliation, while their public catalog scales out horizontally by adding 8 stateless front-end VM instances behind an Azure Load Balancer.',
  },
  {
    id: 'FC-07',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Benefits',
    term: 'Elasticity',
    definition: 'The dynamic, automated capacity of cloud infrastructure to automatically provision additional computing power during peak traffic and deprovision instances when traffic returns to normal.',
    keyDetails: [
      'Directly prevents over-provisioning during off-peak hours',
      'Minimizes cost by matching capacity precisely to instantaneous load',
      'Implemented via tools like Virtual Machine Scale Sets and Azure Autoscale',
    ],
    examTip: 'Scalability is the capability to grow; Elasticity is the automatic adaptation to fluctuating real-time demand.',
    scenarioNote: 'AdventureWorks e-commerce experiences flash-sale traffic surges where request volume jumps 600% in 10 minutes. Azure autoscale rules detect CPU saturation (>75%) and automatically add 12 VM instances within 3 minutes, then gracefully deprovision them when traffic normalizes.',
  },
  {
    id: 'FC-08',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Benefits',
    term: 'High Availability (HA)',
    definition: 'The architectural design of infrastructure and services to guarantee continuous uptime and operational accessibility without human intervention, even during hardware faults.',
    keyDetails: [
      'Measured as uptime percentage (e.g. 99.9% to 99.99%)',
      'Achieved via redundant components, health probes, and automated failover',
      'Supported in Azure via Availability Zones and paired regions',
    ],
    examTip: 'High availability guarantees minimal downtime; Disaster Recovery (DR) focuses on restoring service after a catastrophic regional outage.',
    scenarioNote: 'Contoso Insurance distributes their web tier across three Azure Availability Zones in East US with an Azure Application Gateway. When an unexpected power bus failure isolates Zone 1, health probes instantly redirect 100% of user traffic to Zones 2 and 3 with zero transaction drop.',
  },
  {
    id: 'FC-09',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Benefits',
    term: 'Disaster Recovery (DR)',
    definition: 'Processes, policies, and redundant systems designed to restore mission-critical applications and recover data following catastrophic regional disruptions, power loss, or natural disasters.',
    keyDetails: [
      'Measured by RTO (Recovery Time Objective) and RPO (Recovery Point Objective)',
      'Leverages geo-redundant storage (GRS) and Azure Site Recovery (ASR)',
      'Transfers workload to secondary paired geographical regions hundreds of miles away',
    ],
    examTip: 'If a question asks about surviving an entire regional datacenter failure or hurricane, look for Disaster Recovery and Geo-Redundancy.',
    scenarioNote: 'Tailspin Toys designates East US as primary and West US as secondary paired region. Using Azure Site Recovery (ASR) and Geo-Redundant Storage (GRS), an active hurricane causing a complete regional blackout in Virginia triggers an automated regional failover within 15 minutes, meeting their RTO target.',
  },
  {
    id: 'FC-10',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Governance & Security',
    term: 'Shared Responsibility Model',
    definition: 'Framework dividing security and operational responsibilities between the cloud customer and the cloud provider based on the service model (IaaS, PaaS, SaaS, or On-premises).',
    keyDetails: [
      'Customer ALWAYS retains responsibility for: Data, Endpoints, Accounts & Access',
      'Cloud provider ALWAYS retains responsibility for: Physical datacenter, Physical host, Physical network',
      'OS, Network controls, and Application responsibilities shift depending on IaaS vs PaaS vs SaaS',
    ],
    examTip: 'Information and data security is NEVER the sole responsibility of the cloud provider across ANY cloud model.',
    commonPitfall: 'Do not assume SaaS absolves the customer of data protection or access governance.',
    scenarioNote: 'Litware Corp deploys an e-commerce microservice to Azure App Service (PaaS). Microsoft guarantees physical host security, hypervisor patching, and OS runtime integrity, while Litware remains strictly responsible for sanitizing input data, managing customer passwords, and configuring access policies.',
  },
  {
    id: 'FC-11',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Deployment Models',
    term: 'Public Cloud vs. Private Cloud vs. Hybrid Cloud',
    definition: 'Public Cloud shares hardware multi-tenant across organizations; Private Cloud dedicates infrastructure exclusively to one organization; Hybrid Cloud connects public cloud with on-premises/private infrastructure.',
    keyDetails: [
      'Public: Maximum scalability, zero datacenter management, provider-owned',
      'Private: Dedicated single tenant, total control, higher CapEx/maintenance',
      'Hybrid: Greatest flexibility, allows sensitive data on-prem while bursting compute to cloud',
    ],
    examTip: 'Hybrid Cloud is the optimal solution when legacy compliance mandates local on-premises data storage but demands cloud compute agility.',
    scenarioNote: 'Trey Research is legally required by clinical trial mandates to store patient identifying data on on-premises private datacenter servers. They establish an Azure ExpressRoute hybrid link to burst anonymized statistical compute workloads to Azure batch nodes without moving private patient files off-premises.',
  },
  {
    id: 'FC-12',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Cloud Benefits',
    term: 'Fault Tolerance',
    definition: 'The zero-interruption capability of an application to continue operating smoothly without human intervention even when an individual hardware or software component fails completely.',
    keyDetails: [
      'Employs active-active duplicate hardware components',
      'Differs from HA: HA may have a sub-second failover blip; Fault Tolerance has zero interruption',
      'Backed by Availability Sets (Fault Domains & Update Domains)',
    ],
    examTip: 'Fault Domains represent physical racks sharing common power source and network switch.',
    scenarioNote: 'Proseware Manufacturing provisions two SAP application servers across separate Fault Domains in an Azure Availability Set. When a Top-of-Rack network switch burns out on Rack 1, the standby SAP node on Rack 2 continues processing factory telemetry without a single packet loss.',
  },
  {
    id: 'FC-13',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    category: 'Deployment Models',
    term: 'Multi-Cloud Architecture',
    definition: 'Strategy where an organization intentionally uses cloud computing services from two or more distinct cloud providers (e.g. Azure alongside AWS or GCP) to eliminate vendor lock-in.',
    keyDetails: [
      'Avoids dependency on a single cloud vendor',
      'Enables best-of-breed specialized service selection',
      'Requires unified governance tools like Azure Arc to manage multi-cloud resources',
    ],
    examTip: 'Azure Arc extends Azure Resource Manager governance and policies to on-premises, multi-cloud, and edge environments.',
    scenarioNote: 'Lucerne Publishing runs enterprise web applications on Azure while hosting specialized AI computer vision models on another cloud provider. By deploying Azure Arc, their security team audits compliance policies and collects telemetry across both clouds from a single Azure portal pane.',
  },

  // =========================================================================
  // DOMAIN 2: AZURE ARCHITECTURE & CORE SERVICES (14 CARDS)
  // =========================================================================
  {
    id: 'FC-14',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Core Architecture',
    term: 'Azure Regions',
    definition: 'A geographical area containing one or more physical datacenters connected via a dedicated, latency-defined network perimeter.',
    keyDetails: [
      'Over 60+ regions worldwide across 140+ countries',
      'Customers choose regions to satisfy data residency compliance and minimize latency',
      'Examples: East US, West Europe, Southeast Asia',
    ],
    examTip: 'Resources deployed into Azure are bound to specific regions; data does not move outside without explicit customer configuration.',
    scenarioNote: 'Graphic Design Institute hosts digital learning assets in the West Europe region to comply with strict European Union data residency directives and achieve sub-15ms latency for European students.',
  },
  {
    id: 'FC-15',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Core Architecture',
    term: 'Availability Zones (AZs)',
    definition: 'Physically separated datacenters within the same Azure region, each equipped with independent power, cooling, and networking infrastructure.',
    keyDetails: [
      'Provides protection against an entire datacenter building failure',
      'Minimum of 3 separate availability zones per supported region',
      'Offers 99.99% VM uptime SLA when deployed across two or more AZs',
    ],
    examTip: 'AZs protect against single datacenter building outages, NOT catastrophic regional natural disasters (use Region Pairs for regional DR).',
    scenarioNote: 'Humongous Insurance provisions 3 database replicas across Zones 1, 2, and 3 in East US 2. When an electrical fire disrupts Zone 1, traffic shifts seamlessly to Zones 2 and 3 with zero data loss.',
  },
  {
    id: 'FC-16',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Core Architecture',
    term: 'Region Pairs',
    definition: 'Each Azure region is permanently paired with another region within the same geography (at least 300 miles apart) to ensure regional disaster recovery and prioritized sequential updates.',
    keyDetails: [
      'Updates are rolled out to one paired region at a time to prevent simultaneous platform outages',
      'In a global catastrophe, Azure prioritizes one region in each pair for restoration',
      'Underpins Geo-Redundant Storage (GRS) automatic data replication',
    ],
    examTip: 'Azure Region Pairs are fixed by Microsoft; customers cannot alter or create custom region pair pairings.',
    scenarioNote: 'Coho Winery stores viticulture IoT telemetry in North Europe with GRS replication to West Europe (its paired region). During global host patch rollouts, Microsoft never patches both paired regions simultaneously, ensuring operational continuity.',
  },
  {
    id: 'FC-17',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Management Hierarchy',
    term: 'Azure Resource Manager (ARM)',
    definition: 'The consistent management layer for deploying, managing, securing, and organizing all Azure resources via JSON/Bicep templates, Azure Portal, CLI, and REST APIs.',
    keyDetails: [
      'Every request to Azure passes through ARM for authentication and authorization',
      'Enables Infrastructure as Code (IaC) via declarative ARM and Bicep templates',
      'Applies RBAC, tagging, and Azure Policy uniformly across all management tools',
    ],
    examTip: 'Whether you use the Portal, PowerShell, CLI, or SDK, the exact same ARM API handles the operation.',
    scenarioNote: 'Fourth Coffee automates deployment of 50 branch store infrastructures using identical Bicep ARM templates submitted through their CI/CD release pipeline, enforcing identical network security and RBAC policies.',
  },
  {
    id: 'FC-18',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Management Hierarchy',
    term: 'Azure Resource Groups',
    definition: 'A logical container that holds related resources for an Azure solution, sharing a common lifecycle, administration, and access permissions.',
    keyDetails: [
      'A resource can belong to ONLY ONE resource group at any given time',
      'Deleting a resource group immediately deletes all contained resources',
      'Resource groups have a location metadata, but can contain resources from different regions',
    ],
    examTip: 'Group resources that share the same development lifecycle (e.g., all dev resources in one RG) for easy lifecycle cleanup.',
    scenarioNote: 'Consolidated Messenger creates a temporary resource group `rg-loadtest-qa` containing 20 VMs, 4 databases, and virtual network components for a 2-week stress test. When testing finishes, deleting the resource group instantaneously cleans up all 20+ resources and halts billing.',
  },
  {
    id: 'FC-19',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Management Hierarchy',
    term: 'Azure Management Hierarchy',
    definition: 'Four-level structural hierarchy: Management Groups -> Subscriptions -> Resource Groups -> Resources, designed for scalable enterprise governance.',
    keyDetails: [
      'Management Groups: Organize multiple subscriptions for centralized policy application',
      'Subscriptions: Unit of billing, account boundaries, and scale limits',
      'Resource Groups: Logical containers for related project resources',
      'Resources: Individual service instances (VMs, DBs, VNets)',
    ],
    examTip: 'Policies and RBAC permissions assigned at higher levels (Management Groups) automatically inherit downward to all child subscriptions and resources.',
    scenarioNote: 'Wide World Importers organizes 14 departmental subscriptions under an Enterprise Management Group. By assigning a single Azure Policy requiring mandatory cost-center tags at the Management Group scope, it automatically governs every resource across all 14 subscriptions.',
  },
  {
    id: 'FC-20',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Compute Services',
    term: 'Virtual Machine Scale Sets (VMSS)',
    definition: 'Azure compute resource that lets you create and manage a group of identical, load-balanced virtual machines with automated elasticity.',
    keyDetails: [
      'Automatically increases or decreases VM instance count based on CPU/RAM metrics or schedules',
      'Provides high availability by distributing VMs across Fault Domains and Availability Zones',
      'Underpins AKS node pools and large-scale stateless batch jobs',
    ],
    examTip: 'If an exam question mentions building a scalable web tier that auto-scales identical VMs based on CPU load, choose VM Scale Sets.',
    scenarioNote: 'Southridge Video operates a media transcode cluster using VM Scale Sets across 3 Availability Zones. When users upload thousands of video files, autoscale provisions up to 50 identical worker VMs, distributing encoding tasks before scaling back to 2 baseline VMs.',
  },
  {
    id: 'FC-21',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Compute Services',
    term: 'Azure App Service',
    definition: 'Fully managed PaaS hosting platform for building, deploying, and auto-scaling enterprise web applications, REST APIs, and mobile backends without managing VMs.',
    keyDetails: [
      'Supports .NET, Java, Node.js, PHP, Python, and custom Docker containers',
      'Built-in CI/CD deployment slots for zero-downtime blue/green staging',
      'Automatic OS patching, custom domain SSL certificates, and autoscaling',
    ],
    examTip: 'PaaS web hosting = Azure App Service. No OS management, built-in deployment slots.',
    scenarioNote: 'Wingtip Toys runs its seasonal sales storefront on Azure App Service with deployment staging slots. The engineering team pushes updates to a staging slot for QA validation and executes a zero-downtime VIP slot swap during business hours.',
  },
  {
    id: 'FC-22',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Compute Services',
    term: 'Azure Functions (Serverless)',
    definition: 'Event-driven, serverless compute service that executes code in response to triggers (HTTP requests, database changes, timers, queue messages) without managing infrastructure.',
    keyDetails: [
      'Billed strictly per execution count and memory consumption (Consumption plan)',
      'Zero cost when code is idle and not executing',
      'Micro-billing down to milliseconds of runtime',
    ],
    examTip: 'Key buzzwords: "event-driven", "short-lived task", "no servers to manage", "pay only when code executes".',
    scenarioNote: 'Relecloud processes temperature anomalies from 10,000 IoT sensors. Each anomaly pushes an event to Azure Queue Storage, triggering an Azure Function that validates telemetry, writes an alert record to Cosmos DB, and completes in 75ms.',
  },
  {
    id: 'FC-23',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Compute Services',
    term: 'Azure Container Instances (ACI) vs. AKS',
    definition: 'ACI is the fastest serverless way to run individual Docker containers without cluster management; AKS (Azure Kubernetes Service) is a full-featured container orchestration platform for complex microservices.',
    keyDetails: [
      'ACI: Fast startup, no cluster nodes to configure, pay per second, ideal for batch tasks',
      'AKS: Complex container management, service discovery, self-healing, rolling updates',
      'AKS provides free cluster management; you pay only for agent worker VM nodes',
    ],
    examTip: 'Single container batch job with no cluster overhead = ACI. Enterprise microservices orchestration = AKS.',
    scenarioNote: 'Fabrikam Logistics executes a nightly 4-minute containerized tax reconciliation job using Azure Container Instances (ACI) without maintaining a cluster. Meanwhile, their mission-critical 45-microservice core freight platform runs on Azure Kubernetes Service (AKS).',
  },
  {
    id: 'FC-24',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Networking',
    term: 'Azure Virtual Network (VNet) & Peering',
    definition: 'A private, isolated network in Azure enabling Azure resources to securely communicate with each other, the internet, and on-premises networks; VNet Peering links two separate VNets with low latency over the Azure backbone.',
    keyDetails: [
      'Resources in peered VNets communicate as if they were on the same network',
      'Traffic between peered VNets never traverses the public internet',
      'Network Security Groups (NSGs) act as virtual firewalls filtering inbound and outbound IP traffic',
    ],
    examTip: 'Connecting two VNets in different regions without VPN gateway overhead = Global VNet Peering.',
    scenarioNote: 'Baldwin Museum links their ticketing VNet in East US with their accounting VNet in West US using Global VNet Peering. VMs in both networks communicate over Microsoft private fiber using private 10.x.x.x IP addresses with encryption and zero internet traversal.',
  },
  {
    id: 'FC-25',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Networking',
    term: 'Azure ExpressRoute',
    definition: 'Dedicated private physical connection between on-premises infrastructure and the Microsoft cloud, bypassing the public internet completely.',
    keyDetails: [
      'High-speed, predictable latency (up to 100 Gbps)',
      'Data travels over private connection provider lines, never the public internet',
      'Much higher reliability and security than internet-based site-to-site VPN',
    ],
    examTip: 'Look for requirements like "dedicated private fiber line", "bypasses public internet", "highest reliability and speed".',
    scenarioNote: 'Contoso Bank requires guaranteed 5ms latency and strict regulatory compliance for real-time transaction reconciliation between their on-prem mainframe and Azure database instances. They install a 10 Gbps redundant Azure ExpressRoute connection through Equinix.',
  },
  {
    id: 'FC-26',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Storage Services',
    term: 'Azure Blob Storage Access Tiers',
    definition: 'Optimized pricing tiers for object storage: Hot (frequently accessed data), Cool (infrequent access $\\ge$ 30 days), Cold (rarely accessed $\\ge$ 90 days), and Archive (long-term offline retention $\\ge$ 180 days).',
    keyDetails: [
      'Hot: Highest storage cost, lowest access/transaction cost',
      'Archive: Lowest storage cost, highest access cost; requires hours to rehydrate before reading',
      'Lifecycle Management policies automate tier transitions over time',
    ],
    examTip: 'Archive tier blobs are offline and cannot be read immediately; they require a rehydration process taking several hours.',
    scenarioNote: 'Blue Yonder Airlines retains flight telemetry in Hot tier for 14 days, shifts to Cool tier at day 30, and uses an Azure Storage Lifecycle rule to automatically transition files older than 180 days into Archive tier ($0.00099/GB/month) for 10-year FAA regulatory storage.',
  },
  {
    id: 'FC-27',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture',
    category: 'Data Services',
    term: 'Azure Cosmos DB',
    definition: 'Fully managed, globally distributed NoSQL database service offering single-digit millisecond response times and 99.999% SLA availability.',
    keyDetails: [
      'Supports multi-master write replication across multiple geographical regions',
      'Provides multiple APIs: NoSQL (SQL), MongoDB, Cassandra, Gremlin, Table',
      'Five well-defined consistency levels from Strong to Eventual',
    ],
    examTip: 'Key buzzwords: "globally distributed", "turnkey multi-region writes", "single-digit millisecond latency", "NoSQL".',
    scenarioNote: 'Alpine Ski House operates a worldwide winter sports mobile app with active users in Switzerland, Japan, and Colorado. By configuring Cosmos DB multi-region writes across West Europe, Japan East, and West US, local skiers experience sub-10ms write latency and automatic regional failover.',
  },

  // =========================================================================
  // DOMAIN 3: SECURITY, GOVERNANCE & PRICING (13 CARDS)
  // =========================================================================
  {
    id: 'FC-28',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Identity & Access',
    term: 'Microsoft Entra ID',
    definition: 'Cloud-based identity and access management service providing single sign-on (SSO), multifactor authentication (MFA), and conditional access for cloud and on-premises resources.',
    keyDetails: [
      'Formerly known as Azure Active Directory (Azure AD)',
      'Uses modern web identity protocols: OAuth 2.0, OpenID Connect, SAML',
      'Distinct from on-premises AD DS: uses flat structure without Kerberos or Group Policy Objects (GPOs)',
    ],
    examTip: 'Entra ID manages identities and authentication (who you are), while Azure RBAC manages authorization (what you can do).',
    scenarioNote: 'Contoso University provisions 22,000 student accounts in Microsoft Entra ID. Students use Single Sign-On (SSO) with SAML/OAuth to seamlessly access Microsoft 365, internal course portals, and campus library tools with one set of credentials.',
  },
  {
    id: 'FC-29',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Identity & Access',
    term: 'Multi-Factor Authentication (MFA)',
    definition: 'Security process requiring users to supply two or more independent verification factors before being granted account access.',
    keyDetails: [
      'Factor 1: Something you know (Password / PIN)',
      'Factor 2: Something you have (Authenticator app, hardware token, phone)',
      'Factor 3: Something you are (Biometrics, fingerprint, facial scan)',
    ],
    examTip: 'Requiring a password and a PIN is NOT MFA because both are in the same category ("something you know").',
    scenarioNote: 'City Power & Light mandates that all electrical grid engineers authenticate using corporate passwords (something they know) plus Microsoft Authenticator push notification approval (something they have) before accessing supervisory cloud control consoles.',
  },
  {
    id: 'FC-30',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Identity & Access',
    term: 'Conditional Access',
    definition: 'Microsoft Entra ID tool that evaluates real-time signals (user identity, device health, IP location, application) to enforce contextual access decisions like enforcing MFA or blocking access.',
    keyDetails: [
      'Operates on an "If this condition is met, Then enforce this control" model',
      'Can block sign-ins from unrecognized countries or non-compliant company devices',
      'Requires Microsoft Entra ID P1 or P2 licensing',
    ],
    examTip: 'If a scenario requires prompting for MFA only when users connect from outside corporate offices, Conditional Access is the solution.',
    scenarioNote: 'Northwind Traders configures an Entra Conditional Access policy where logins originating from inside corporate headquarters require only standard credentials, but any login from public Wi-Fi or unmanaged personal devices triggers an immediate MFA verification challenge.',
  },
  {
    id: 'FC-31',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Identity & Access',
    term: 'Role-Based Access Control (RBAC)',
    definition: 'Authorization system built on Azure Resource Manager that provides fine-grained access management to Azure resources based on the principle of least privilege.',
    keyDetails: [
      'Built-in roles: Owner (full access + delegate), Contributor (full access minus delegate), Reader (view only)',
      'Assigned to Security Principal (User/Group/Managed Identity) over a defined Scope',
      'Inherits downward from parent scopes to child resources',
    ],
    examTip: 'Granting a contractor ability to manage VMs without granting permissions to delete the resource group or manage billing = custom or built-in RBAC role.',
    scenarioNote: 'Fabrikam assigns external database contractors the "SQL DB Contributor" role scoped strictly to the `rg-finance-dev` resource group, preventing them from modifying production databases, altering network security groups, or accessing billing subscriptions.',
  },
  {
    id: 'FC-32',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Security Architecture',
    term: 'Zero Trust Methodology',
    definition: 'Modern security model based on the premise that organizations should never trust any request by default, regardless of where it originates or what network it travels across.',
    keyDetails: [
      'Core Principle 1: Verify explicitly (always authenticate and authorize on all data points)',
      'Core Principle 2: Use least privilege access (JIT, JEA, adaptive risk policies)',
      'Core Principle 3: Assume breach (minimize blast radius, segment access, encrypt end-to-end)',
    ],
    examTip: 'Zero Trust assumes adversaries already exist inside your perimeter network and enforces continuous explicit verification.',
    scenarioNote: 'Woodgrove Financial adopts Zero Trust by eliminating broad internal VPN trust. Every microservice explicitly verifies incoming tokens via mTLS, enforces Just-In-Time (JIT) access, and assumes internal network segmentation has already been penetrated.',
  },
  {
    id: 'FC-33',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Security Services',
    term: 'Microsoft Defender for Cloud',
    definition: 'Cloud Security Posture Management (CSPM) and Cloud Workload Protection Platform (CWPP) that monitors security health, generates Secure Scores, and alerts on threats across hybrid clouds.',
    keyDetails: [
      'Provides continuous real-time Secure Score evaluation and remediation actions',
      'Detects misconfigurations against industry regulatory benchmarks (PCI-DSS, ISO 27001)',
      'Protects hybrid workloads across Azure, AWS, and GCP',
    ],
    examTip: 'For questions about calculating an organization\'s overall security score and hardening posture, select Defender for Cloud.',
    scenarioNote: 'Contoso Retail connects 120 Azure subscriptions and on-prem servers to Microsoft Defender for Cloud. Defender identifies 18 VMs missing disk encryption and provides one-click remediation playbooks, raising their organizational Secure Score from 52% to 89%.',
  },
  {
    id: 'FC-34',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Security Services',
    term: 'Microsoft Sentinel',
    definition: 'Cloud-native Security Information and Event Management (SIEM) and Security Orchestration, Automation, and Response (SOAR) solution for intelligent security analytics across the enterprise.',
    keyDetails: [
      'Collects security data at cloud scale across all users, devices, applications, and infrastructure',
      'Detects previously undetected threats using Microsoft AI and machine learning',
      'Investigates threats with artificial intelligence and automates responses via playbooks',
    ],
    examTip: 'SIEM and SOAR buzzwords = Microsoft Sentinel. Combines log aggregation with automated threat hunting.',
    scenarioNote: 'Tailwind Traders streams sign-in logs, Azure Firewall events, and workstation endpoint alerts into Microsoft Sentinel. When an anomaly triggers from an impossible travel location, Sentinel automated playbooks automatically revoke user session tokens and alert the SOC tier-2 team.',
  },
  {
    id: 'FC-35',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Security Services',
    term: 'Azure Key Vault',
    definition: 'Centralized cloud service for securely storing and accessing sensitive cryptographic keys, application secrets, passwords, certificates, and API tokens.',
    keyDetails: [
      'Backed by FIPS 140-2 validated Hardware Security Modules (HSMs)',
      'Eliminates storing plaintext passwords and connection strings in source code',
      'Provides audit logging of all secret access attempts',
    ],
    examTip: 'Best practice for securing database passwords and certificates across microservices = Azure Key Vault.',
    scenarioNote: 'AdventureWorks microservices query Azure Key Vault using Managed Identities to fetch SQL connection strings and Stripe payment gateway private API keys dynamically, eliminating all plaintext passwords from application settings and Git commits.',
  },
  {
    id: 'FC-36',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Governance & Compliance',
    term: 'Azure Policy',
    definition: 'Governance service that evaluates Azure resources by comparing their properties against customizable business rules to enforce company standards and compliance SLAs.',
    keyDetails: [
      'Enforces rules like: "Only deploy VMs in West Europe", "Require specific tags", or "Prevent public IP addresses"',
      'Actions include: Audit, Deny, Modify, Append, and Remediate',
      'Evaluates resources continuously, not just during initial creation',
    ],
    examTip: 'Azure Policy enforces rules and prevents non-compliant deployments; Azure RBAC controls user permissions.',
    scenarioNote: 'Litware Corp applies an Azure Policy with the "Deny" effect on their development subscription, preventing engineers from provisioning costly GPU-accelerated N-series VMs or deploying resources to unapproved geographical regions outside North Europe.',
  },
  {
    id: 'FC-37',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Governance & Compliance',
    term: 'Azure Resource Locks',
    definition: 'Protection mechanism preventing accidental deletion or modification of mission-critical Azure resources, regardless of user RBAC permissions.',
    keyDetails: [
      'CanNotDelete (Delete lock): Authorized users can read and modify a resource, but cannot delete it',
      'ReadOnly (Read-only lock): Authorized users can only read a resource; they cannot modify or delete it',
      'Applied at Subscription, Resource Group, or individual Resource level and inherited downward',
    ],
    examTip: 'Even an Azure Subscription Owner cannot delete a resource protected by a CanNotDelete lock until the lock is removed.',
    scenarioNote: 'Fabrikam places a "CanNotDelete" resource lock on their production enterprise database `sqldb-orders-prod`. An administrator with Subscription Owner permissions attempting to delete the parent resource group is blocked with an ARM lock error until the lock is intentionally removed.',
  },
  {
    id: 'FC-38',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Pricing & Cost Optimization',
    term: 'Azure Pricing Calculator vs. TCO Calculator',
    definition: 'The Pricing Calculator estimates upfront monthly cloud costs for planned Azure resources; the Total Cost of Ownership (TCO) Calculator estimates cost savings of migrating on-premises workloads to Azure.',
    keyDetails: [
      'Pricing Calculator: "What will it cost me to run 5 VMs and a SQL database in Azure next month?"',
      'TCO Calculator: "How much money will my company save over 5 years if we retire our on-prem datacenter and move to Azure?"',
      'TCO factors in datacenter power, cooling, real estate, and IT labor overhead',
    ],
    examTip: 'Migrating from on-prem with comparison reports = TCO Calculator. Estimating new cloud monthly bill = Pricing Calculator.',
    scenarioNote: 'Tailspin Toys CFO requested a comparative business case. The cloud architect used the TCO Calculator to prove a 41% 5-year savings over physical datacenter power, cooling, and hardware maintenance, then used the Azure Pricing Calculator to model exact monthly VM and blob storage line items.',
  },
  {
    id: 'FC-39',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Pricing & Cost Optimization',
    term: 'Cost Management + Billing',
    definition: 'Suite of tools to analyze spending, configure proactive budget alerts, set spending limits, and obtain recommendations for cloud cost optimization.',
    keyDetails: [
      'Set automated budget alert emails when spending reaches thresholds (e.g. 80% or 100%)',
      'Provides cost allocation by department using Azure Tags',
      'Recommends shutting down idle resources and buying Azure Reservations',
    ],
    examTip: 'Budget alerts notify administrators when spending hits a threshold, but do NOT automatically stop or delete production resources.',
    scenarioNote: 'Adatum Financial establishes an Azure Budget of $15,000/month for their R&D department. When automated billing forecasts predict monthly spend will hit 85% by day 18, Cost Management emails alerts to engineering managers to deallocate idle development VMs.',
  },
  {
    id: 'FC-40',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security & Pricing',
    category: 'Service Level Agreements',
    term: 'Service Level Agreements (SLAs) & Composite SLAs',
    definition: 'Formal commitment by Microsoft defining performance and uptime benchmarks; Composite SLAs calculate the combined overall availability of multiple interconnected dependent services.',
    keyDetails: [
      'Free or Preview tier services have 0% SLA (no financial commitment)',
      'Failure to meet SLA results in Service Credits applied to customer bills, not direct cash refunds',
      'Composite SLA of two services with 99.9% SLA = 99.9% * 99.9% = 99.8% (lower than individual component SLAs)',
    ],
    examTip: 'Composite SLA for serial dependent services is ALWAYS lower than the SLA of any individual component.',
    scenarioNote: 'Contoso Health designs an e-prescription system chaining Azure App Service (99.95% SLA) with Azure SQL Database (99.99% SLA). Their enterprise architect calculates a serial composite SLA of 99.94% (0.9995 * 0.9999) to verify compliance with national healthcare uptime requirements.',
  },
];

/**
 * Retrieve saved card mastery IDs from localStorage.
 */
export function getStoredFlashcardMastery(): Record<string, boolean> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Toggle mastery status for a specific flashcard ID.
 */
export function toggleCardMastery(cardId: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const mastery = getStoredFlashcardMastery();
    const currentStatus = !!mastery[cardId];
    const newStatus = !currentStatus;
    if (newStatus) {
      mastery[cardId] = true;
    } else {
      delete mastery[cardId];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mastery));
    return newStatus;
  } catch {
    return false;
  }
}

/**
 * Reset all flashcard mastery records.
 */
export function resetFlashcardMastery(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Compute aggregate progress statistics across the flashcard deck.
 */
export function computeFlashcardStats(
  cards: readonly Flashcard[],
  mastery: Record<string, boolean>
): FlashcardStats {
  const totalCards = cards.length;
  const masteredCards = cards.filter((c) => !!mastery[c.id]).length;
  const masteredPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const domainMap: Record<
    string,
    { title: string; total: number; mastered: number }
  > = {
    'DOM-CONCEPTS': { title: 'Cloud Concepts', total: 0, mastered: 0 },
    'DOM-SERVICES': { title: 'Azure Architecture & Services', total: 0, mastered: 0 },
    'DOM-SECURITY': { title: 'Security & Pricing', total: 0, mastered: 0 },
  };

  for (const card of cards) {
    if (!domainMap[card.domainId]) {
      domainMap[card.domainId] = { title: card.domainTitle, total: 0, mastered: 0 };
    }
    domainMap[card.domainId]!.total += 1;
    if (mastery[card.id]) {
      domainMap[card.domainId]!.mastered += 1;
    }
  }

  const domainBreakdown = Object.entries(domainMap).map(([domId, val]) => ({
    domainId: domId,
    domainTitle: val.title,
    total: val.total,
    mastered: val.mastered,
    percentage: val.total > 0 ? Math.round((val.mastered / val.total) * 100) : 0,
  }));

  return {
    totalCards,
    masteredCards,
    masteredPercentage,
    domainBreakdown,
  };
}
