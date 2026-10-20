-- Seed: 20261019000000_seed.sql / supabase/seed/questions.sql
-- Description: 52 synthetic original questions categorized across 3 syllabus domains
-- Note: 100% original phrasing based on public skills outline topics; zero proprietary vendor text.

-- 1. Insert Question Domains
INSERT INTO question_domains (id, title, description, display_order)
VALUES
  ('DOM-CONCEPTS', 'Cloud Fundamentals & Architectures', 'Core definitions of shared responsibility, cloud models, elasticity, and high availability.', 1),
  ('DOM-SERVICES', 'Compute, Storage & Networking Services', 'Virtual compute instances, object and block storage tiers, virtual networks, and subnets.', 2),
  ('DOM-SECURITY', 'Identity, Governance & Compliance Controls', 'Role-based access controls, network security groups, policies, and cost tracking.', 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 2. Insert 52 Synthetic Questions
INSERT INTO questions (id, domain_id, difficulty, prompt, options, correct_answer_index, explanation, source_outline_theme)
VALUES
-- DOM-CONCEPTS (1-18)
('a0000001-0000-0000-0000-000000000001', 'DOM-CONCEPTS', 'Novice',
 'Which cloud computing characteristic ensures that computing resources can automatically expand or contract based on fluctuating real-time workload demand?',
 '["High Availability", "Elasticity", "Fault Tolerance", "Disaster Recovery"]'::jsonb,
 1, 'Elasticity is the capability to dynamically allocate and deallocate computing resources to match instantaneous demand spikes without manual intervention.', 'Describe benefits of cloud services'),

('a0000001-0000-0000-0000-000000000002', 'DOM-CONCEPTS', 'Novice',
 'In a public cloud Shared Responsibility Model, which operational responsibility remains exclusively managed by the customer across all deployment models?',
 '["Physical datacenter security", "Data classification and client endpoints", "Hypervisor kernel patch management", "Host server firmware updating"]'::jsonb,
 1, 'Data classification, accountability, and user endpoint credentials always remain the sole responsibility of the customer regardless of IaaS, PaaS, or SaaS.', 'Describe the shared responsibility model'),

('a0000001-0000-0000-0000-000000000003', 'DOM-CONCEPTS', 'Associate',
 'An organization migrates an existing enterprise database to a cloud environment where the cloud provider manages OS patching and database backups, while the organization manages database schema and indexing. Which cloud service model is being utilized?',
 '["Infrastructure as a Service (IaaS)", "Platform as a Service (PaaS)", "Software as a Service (SaaS)", "Bare Metal Hosting"]'::jsonb,
 1, 'Platform as a Service (PaaS) abstracts underlying operating system maintenance and hardware provisioning, permitting the customer to focus on schema logic and application code.', 'Describe cloud service types'),

('a0000001-0000-0000-0000-000000000004', 'DOM-CONCEPTS', 'Novice',
 'Which operational expense model describes spending money on physical server hardware upfront before commissioning services?',
 '["Operational Expenditure (OpEx)", "Capital Expenditure (CapEx)", "Elastic Pay-As-You-Go", "Consumption-Based Spending"]'::jsonb,
 1, 'Capital Expenditure (CapEx) involves upfront investment in physical facilities, hardware, and infrastructure depreciated over time.', 'Describe cloud benefits: CapEx vs OpEx'),

('a0000001-0000-0000-0000-000000000005', 'DOM-CONCEPTS', 'Associate',
 'What architectural topology pattern ensures that an application remains operational even if an entire isolated physical facility loses utility power and network connectivity?',
 '["Single Datacenter Clustering", "Availability Zone Redundancy", "Scale-Up Vertical Compute", "Single-Zone Replication"]'::jsonb,
 1, 'Availability Zones are physically separated datacenters within a region with independent power, cooling, and networking to withstand localized facility outages.', 'Describe core architectural components'),

('a0000001-0000-0000-0000-000000000006', 'DOM-CONCEPTS', 'Advanced',
 'A financial organization must maintain regulatory data within a private on-premises datacenter while leveraging public cloud burst compute for quarterly risk simulations. What cloud architecture satisfies this requirement?',
 '["Private Cloud Only", "Public Cloud Only", "Hybrid Cloud Architecture", "Community Cloud Only"]'::jsonb,
 2, 'Hybrid cloud joins private on-premises infrastructure with public cloud elastic resources, allowing sensitive data residency while bursting compute.', 'Describe cloud deployment models'),

('a0000001-0000-0000-0000-000000000007', 'DOM-CONCEPTS', 'Novice',
 'What term describes a system capability to remain accessible and operational without noticeable disruption during planned hardware maintenance or transient failures?',
 '["Scalability", "High Availability", "Agility", "Cost Optimization"]'::jsonb,
 1, 'High availability refers to designing systems to minimize downtime and provide continuous service through redundant components and automated failover.', 'Describe benefits of cloud services'),

('a0000001-0000-0000-0000-000000000008', 'DOM-CONCEPTS', 'Associate',
 'In a Software as a Service (SaaS) solution such as cloud-hosted productivity email, which layer is maintained by the cloud vendor?',
 '["Application code and runtime only", "Underlying infrastructure, application code, and runtime", "Customer data ownership only", "Client workstation configuration"]'::jsonb,
 1, 'In SaaS, the vendor manages the entire stack from physical hardware and networking to OS, runtime, and the application software itself.', 'Describe cloud service types'),

('a0000001-0000-0000-0000-000000000009', 'DOM-CONCEPTS', 'Novice',
 'How does consumption-based pricing benefit early-stage startups compared to traditional datacenter hosting?',
 '["Guarantees fixed predictable billing regardless of usage", "Requires upfront multi-year hardware leasing contracts", "Eliminates idle resource costs by billing only for actual resource utilization", "Provides unlimited complimentary compute instances"]'::jsonb,
 2, 'Consumption-based pricing aligns expenses directly with active utilization, preventing sunk capital investments on idle hardware.', 'Describe cloud benefits: CapEx vs OpEx'),

('a0000001-0000-0000-0000-000000000010', 'DOM-CONCEPTS', 'Associate',
 'Which metric quantifies the maximum acceptable duration of data loss during an unexpected disaster event?',
 '["Recovery Time Objective (RTO)", "Recovery Point Objective (RPO)", "Mean Time Between Failures (MTBF)", "Service Level Agreement (SLA)"]'::jsonb,
 1, 'Recovery Point Objective (RPO) dictates the maximum acceptable age of data files that must be recovered from backup storage after a disruption.', 'Describe disaster recovery concepts'),

('a0000001-0000-0000-0000-000000000011', 'DOM-CONCEPTS', 'Novice',
 'What is the primary benefit of deploying applications across multiple geographically distributed cloud regions?',
 '["Reduces software licensing fees", "Decreases network latency for globally dispersed end-users", "Eliminates the requirement for user identity authentication", "Provides automatic local disk defragmentation"]'::jsonb,
 1, 'Deploying resources near geographic user concentrations reduces packet travel distance, significantly lowering round-trip network latency.', 'Describe benefits of cloud services'),

('a0000001-0000-0000-0000-000000000012', 'DOM-CONCEPTS', 'Advanced',
 'When transitioning an on-premises web tier to Infrastructure as a Service (IaaS), which operational responsibility transfers to the cloud provider?',
 '["Web server security patch installation", "Physical server hardware replacement and facility cooling", "Guest OS firewall configuration", "Database user credential rotation"]'::jsonb,
 1, 'In IaaS, the cloud provider manages the physical server hardware, datacenter power, cooling, and virtualization hypervisors.', 'Describe the shared responsibility model'),

('a0000001-0000-0000-0000-000000000013', 'DOM-CONCEPTS', 'Novice',
 'What is the term for increasing the compute capability of an existing virtual machine by adding more vCPUs and RAM?',
 '["Horizontal Scaling (Scaling Out)", "Vertical Scaling (Scaling Up)", "Elastic Autoscaling", "Geographic Partitioning"]'::jsonb,
 1, 'Vertical scaling (scale up) increases the capacity of an individual resource, such as upgrading an instance from 4 vCPUs to 16 vCPUs.', 'Describe benefits of cloud services: Scalability'),

('a0000001-0000-0000-0000-000000000014', 'DOM-CONCEPTS', 'Associate',
 'What architectural strategy adds identical virtual machine instances behind a load balancer during peak traffic surges?',
 '["Vertical Scaling (Scaling Up)", "Horizontal Scaling (Scaling Out)", "Static Resource Reservation", "Local Redundant Storage"]'::jsonb,
 1, 'Horizontal scaling (scale out) adds additional worker instances to distribute processing load across multiple parallel nodes.', 'Describe benefits of cloud services: Scalability'),

('a0000001-0000-0000-0000-000000000015', 'DOM-CONCEPTS', 'Advanced',
 'Which factor most directly influences cloud Service Level Agreements (SLAs) for composite multi-tier application architectures?',
 '["Combined mathematical product of individual component availability percentages", "The lowest individual component SLA only", "The highest component SLA in the architecture", "The total quantity of provisioned virtual CPU cores"]'::jsonb,
 0, 'Composite SLAs multiply the individual service availability figures (e.g. 99.9% × 99.95% = 99.85%) to calculate overall system availability.', 'Describe cloud service level agreements'),

('a0000001-0000-0000-0000-000000000016', 'DOM-CONCEPTS', 'Novice',
 'What is the primary characteristic of serverless computing architectures?',
 '["Zero hardware exists in the cloud datacenter", "Developers manage virtual machine operating system kernels", "Execution occurs without server management, automatically scaling with code event triggers", "Billing is charged as a permanent monthly flat fee"]'::jsonb,
 2, 'Serverless abstracts server provisioning entirely; code executes in response to events and charges only for the exact execution duration and memory consumed.', 'Describe cloud computing concepts'),

('a0000001-0000-0000-0000-000000000017', 'DOM-CONCEPTS', 'Associate',
 'Which cloud benefit describes the speed with which developers can deploy new compute infrastructure and prototype applications in minutes?',
 '["Disaster Recovery", "Agility", "Fault Tolerance", "Predictable Depreciation"]'::jsonb,
 1, 'Agility allows software engineering teams to provision, test, iterate, and decommission modern cloud resources within minutes without purchasing cycles.', 'Describe benefits of cloud services: Agility'),

('a0000001-0000-0000-0000-000000000018', 'DOM-CONCEPTS', 'Advanced',
 'In a disaster recovery strategy, what distinguishes a Warm Standby from a Cold Standby design?',
 '["Warm Standby runs scaled-down active resources ready to take immediate traffic; Cold Standby remains completely unprovisioned until failover", "Warm Standby requires manual server racking; Cold Standby is fully automated", "Warm Standby operates only in private on-premises datacenters", "Cold Standby replicates data synchronously every second"]'::jsonb,
 0, 'A warm standby maintains minimal running instances with continuous replication ready to scale up immediately upon primary failure.', 'Describe disaster recovery concepts'),

-- DOM-SERVICES (19-35)
('a0000001-0000-0000-0000-000000000019', 'DOM-SERVICES', 'Novice',
 'Which cloud storage tier is optimized for storing infrequently accessed files that must remain immediately accessible when requested?',
 '["Hot Access Tier", "Cool Access Tier", "Archive Access Tier", "Transient Ephemeral Tier"]'::jsonb,
 1, 'Cool access tiers provide lower storage cost for data retained for at least 30 days that is accessed infrequently but requires sub-second retrieval.', 'Describe storage services'),

('a0000001-0000-0000-0000-000000000020', 'DOM-SERVICES', 'Associate',
 'Which cloud resource acts as an isolated private network partition where virtual machines and private load balancers can safely communicate?',
 '["Virtual Network (VNet / VPC)", "Content Delivery Network (CDN)", "Internet Gateway", "Public DNS Zone"]'::jsonb,
 0, 'A Virtual Network provides a secure, logically isolated private network environment with user-defined IP address ranges and subnets.', 'Describe compute and networking services'),

('a0000001-0000-0000-0000-000000000021', 'DOM-SERVICES', 'Associate',
 'What mechanism enables secure, direct packet routing between two distinct virtual networks without sending traffic over the public internet?',
 '["Virtual Network Peering", "Public NAT Gateway", "Internet Routing Table", "Point-to-Site VPN"]'::jsonb,
 0, 'Virtual Network Peering connects separate virtual networks directly via the private cloud backbone fabric with minimal latency and high bandwidth.', 'Describe networking services'),

('a0000001-0000-0000-0000-000000000022', 'DOM-SERVICES', 'Novice',
 'Which cloud service model executes containerized microservices without requiring the engineer to manage underlying operating system updates or cluster nodes?',
 '["Bare Metal Server", "Serverless Container Service (e.g. Container Apps / Cloud Run)", "Unmanaged Virtual Machine", "Physical SAN Storage"]'::jsonb,
 1, 'Serverless container services run OCI containers on-demand with automatic scaling, zero node maintenance, and per-second execution billing.', 'Describe compute services: Containers'),

('a0000001-0000-0000-0000-000000000023', 'DOM-SERVICES', 'Advanced',
 'A media company must store petabytes of historical video archives that are accessed less than once per year and can tolerate several hours of retrieval latency. Which tier minimizes cost?',
 '["Hot Tier", "Cool Tier", "Archive Tier", "Premium SSD Tier"]'::jsonb,
 2, 'Archive tiers deliver the lowest storage cost per gigabyte for long-term records that permit asynchronous retrieval over hours.', 'Describe storage services: Storage tiers'),

('a0000001-0000-0000-0000-000000000024', 'DOM-SERVICES', 'Associate',
 'Which component within a virtual cloud network distributes incoming HTTP/HTTPS traffic across a healthy pool of backend compute instances?',
 '["Network Security Group", "Application Load Balancer", "Virtual Network Peering", "Route Table Target"]'::jsonb,
 1, 'Application Load Balancers operate at Layer 7 to inspect HTTP headers and balance client requests evenly across healthy application instances.', 'Describe networking services'),

('a0000001-0000-0000-0000-000000000025', 'DOM-SERVICES', 'Novice',
 'What storage redundancy configuration replicates data three times across three separate physical availability zones within a single primary region?',
 '["Locally Redundant Storage (LRS)", "Zone-Redundant Storage (ZRS)", "Geo-Redundant Storage (GRS)", "Read-Access Geo-Redundant Storage (RA-GRS)"]'::jsonb,
 1, 'Zone-Redundant Storage (ZRS) synchronously replicates data across three availability zones in the primary region to guard against facility failure.', 'Describe storage services: Redundancy'),

('a0000001-0000-0000-0000-000000000026', 'DOM-SERVICES', 'Associate',
 'What network device allows private subnet instances lacking public IP addresses to initiate outbound requests to external APIs while blocking unsolicited inbound connections?',
 '["Internet Gateway", "NAT Gateway", "VPN Gateway", "Application Gateway"]'::jsonb,
 1, 'A NAT Gateway translates private IP addresses to an elastic public IP for outbound internet traffic while prohibiting unsolicited inbound connections.', 'Describe networking services: NAT'),

('a0000001-0000-0000-0000-000000000027', 'DOM-SERVICES', 'Advanced',
 'Which cloud database architecture allows instant automatic scaling to zero when no queries are active, eliminating compute charges during quiet night hours?',
 '["Provisioned Dedicated SQL Cluster", "Serverless Relational Database", "Unmanaged VM with PostgreSQL", "Self-Hosted MySQL Container"]'::jsonb,
 1, 'Serverless relational databases automatically pause compute resources during inactivity and resume in seconds upon receiving a new connection.', 'Describe database services'),

('a0000001-0000-0000-0000-000000000028', 'DOM-SERVICES', 'Novice',
 'Which service provides a globally distributed network of proxy servers that cache static images, stylesheets, and scripts close to end-users?',
 '["Content Delivery Network (CDN)", "Domain Name System (DNS)", "Private Endpoints", "Virtual Network Gateway"]'::jsonb,
 0, 'A Content Delivery Network caches static and streaming media at point-of-presence edge locations to reduce web latency and server load.', 'Describe networking services: CDN'),

('a0000001-0000-0000-0000-000000000029', 'DOM-SERVICES', 'Associate',
 'What is the main technical distinction between a virtual machine and a software container?',
 '["Virtual machines share the host operating system kernel; containers virtualize hardware", "Containers package application code with dependencies sharing the host OS kernel; VMs virtualize full hardware and run a guest OS", "Containers require physical hardware cards; VMs run inside web browsers", "Containers cannot communicate across networks"]'::jsonb,
 1, 'Containers share the host kernel while maintaining isolated user spaces, resulting in lightweight, fast-starting processes compared to full hypervisor VMs.', 'Describe compute services: Containers vs VMs'),

('a0000001-0000-0000-0000-000000000030', 'DOM-SERVICES', 'Advanced',
 'When designing a relational database with multi-region read replicas, what consistency model applies when reads are served from an asynchronous secondary region?',
 '["Strong Immediate Consistency", "Eventual Consistency", "Serial Transaction Isolation", "Synchronous Mirroring"]'::jsonb,
 1, 'Asynchronous replication across distant regions introduces replication lag, meaning reads against read replicas exhibit eventual consistency.', 'Describe storage & database architectures'),

('a0000001-0000-0000-0000-000000000031', 'DOM-SERVICES', 'Novice',
 'Which cloud service lets engineers write small event-driven functions triggered by file uploads or HTTP webhooks without maintaining servers?',
 '["Serverless Functions (FaaS)", "Dedicated Compute VM", "Block Storage Volume", "Network Route Table"]'::jsonb,
 0, 'Function as a Service (FaaS) executes discrete stateless functions on-demand in response to events, billing strictly for compute milliseconds.', 'Describe compute services: Serverless'),

('a0000001-0000-0000-0000-000000000032', 'DOM-SERVICES', 'Associate',
 'Which cloud resource provides network connectivity between an on-premises enterprise network and a cloud virtual network using an encrypted IPsec tunnel over the public internet?',
 '["Express Dedicated Circuit", "Site-to-Site VPN Gateway", "Point-to-Site Client VPN", "Public Load Balancer"]'::jsonb,
 1, 'A Site-to-Site VPN Gateway creates an encrypted IPsec tunnel connecting an on-premises VPN appliance to a cloud virtual network gateway.', 'Describe networking services: VPN'),

('a0000001-0000-0000-0000-000000000033', 'DOM-SERVICES', 'Advanced',
 'An organization needs high-throughput dedicated private connectivity between their datacenter and cloud provider that completely bypasses the public internet. What service satisfies this?',
 '["Site-to-Site IPsec VPN", "Dedicated Direct Cloud Interconnect / ExpressRoute", "NAT Gateway", "Public DNS Resolver"]'::jsonb,
 1, 'Dedicated physical interconnect circuits link client datacenters directly to the cloud provider backbone, delivering higher throughput and deterministic latency.', 'Describe networking services: Hybrid connectivity'),

('a0000001-0000-0000-0000-000000000034', 'DOM-SERVICES', 'Novice',
 'What storage type is ideal for attaching high-performance, low-latency block volumes to virtual machine instances as boot disks?',
 '["Object Blob Storage", "Managed Block Storage Disk (SSD/HDD)", "Shared File System", "Cold Archive Storage"]'::jsonb,
 1, 'Managed block storage disks provide persistent, low-latency virtual disk volumes suitable for OS boot drives and intensive database workloads.', 'Describe storage services: Block storage'),

('a0000001-0000-0000-0000-000000000035', 'DOM-SERVICES', 'Associate',
 'Which cloud database paradigm is specifically optimized for storing semi-structured documents, key-value tuples, and wide-column graphs with low-latency global distribution?',
 '["Relational SQL Database", "NoSQL Multi-Model Database", "Data Warehouse OLAP", "Local Block Storage"]'::jsonb,
 1, 'NoSQL databases support non-relational document, key-value, and graph schemas with elastic horizontal partitioning across global regions.', 'Describe database services: NoSQL'),

-- DOM-SECURITY (36-52)
('a0000001-0000-0000-0000-000000000036', 'DOM-SECURITY', 'Novice',
 'What security principle dictates granting users only the minimum necessary permissions required to fulfill their specific job responsibilities?',
 '["Defense in Depth", "Principle of Least Privilege", "Separation of Storage", "Zero Latency Access"]'::jsonb,
 1, 'The Principle of Least Privilege restricts identity access rights to the exact roles and scopes necessary to execute required tasks.', 'Describe identity, access, and security'),

('a0000001-0000-0000-0000-000000000037', 'DOM-SECURITY', 'Associate',
 'Which security control functions as a virtual firewall at the subnet and network interface level, filtering inbound and outbound traffic via port and IP rules?',
 '["Network Security Group (NSG) / Security Group", "Application Gateway", "Content Delivery Network", "Public NAT Gateway"]'::jsonb,
 0, 'Security Groups filter network packet flow to virtual instances and subnets based on 5-tuple rules (source, destination, port, protocol, allow/deny).', 'Describe security tools'),

('a0000001-0000-0000-0000-000000000038', 'DOM-SECURITY', 'Novice',
 'What authentication mechanism requires users to supply two or more distinct verification factors before accessing corporate cloud resources?',
 '["Single Sign-On (SSO)", "Multi-Factor Authentication (MFA)", "Role-Based Access Control (RBAC)", "Resource Tagging"]'::jsonb,
 1, 'Multi-Factor Authentication verifies user identity through combinations of something you know (password), something you have (app token), or biometric factors.', 'Describe identity concepts: MFA'),

('a0000001-0000-0000-0000-000000000039', 'DOM-SECURITY', 'Associate',
 'Which security methodology assumes that every request originating inside or outside the network perimeter must be fully authenticated, authorized, and encrypted before granting access?',
 '["Perimeter-Only Security", "Zero Trust Architecture", "Open Network Trust", "Air-Gapped Isolation"]'::jsonb,
 1, 'Zero Trust security operates on the principle of "never trust, always verify", validating every user, device, network session, and payload.', 'Describe security concepts: Zero Trust'),

('a0000001-0000-0000-0000-000000000040', 'DOM-SECURITY', 'Advanced',
 'Which access management mechanism allows an application running on a virtual machine to securely authenticate to a cloud database without storing credentials or passwords in source code?',
 '["Managed Identity / IAM Instance Role", "Hardcoded API Keys in Config", "Public Anonymous Endpoints", "Shared Admin Passwords in Environment Files"]'::jsonb,
 0, 'Managed Identities assign an automated identity in the cloud directory to the instance, permitting certificate-based token requests without credential leakage.', 'Describe identity services'),

('a0000001-0000-0000-0000-000000000041', 'DOM-SECURITY', 'Novice',
 'What cloud governance tool applies rules across cloud subscriptions to enforce compliance standards, such as prohibiting the creation of public IP addresses on database nodes?',
 '["Cloud Policy Engine (e.g. Azure Policy / AWS Organizations)", "Cost Allocation Tags", "Network Peering", "Availability Zones"]'::jsonb,
 0, 'Policy governance engines evaluate resource definitions during provisioning to enforce organizational standards, prevent misconfigurations, and audit compliance.', 'Describe governance tools'),

('a0000001-0000-0000-0000-000000000042', 'DOM-SECURITY', 'Associate',
 'Which cryptographic service provides secure storage and lifecycle management for application encryption keys, SSL/TLS certificates, and sensitive secrets in hardware security modules (HSMs)?',
 '["Cloud Key Vault / Secrets Manager", "Object Storage Bucket", "Virtual Machine Boot Disk", "Public GitHub Repository"]'::jsonb,
 0, 'Key Vaults and Secrets Managers safeguard secrets, connection strings, and certificates with strict access logging and HSM encryption.', 'Describe security tools: Key management'),

('a0000001-0000-0000-0000-000000000043', 'DOM-SECURITY', 'Novice',
 'What practice involves attaching metadata key-value pairs (such as Department=Finance, Environment=Production) to cloud resources for categorization and billing tracking?',
 '["Resource Tagging", "Subnet Masking", "Role Assignment", "Data Sharding"]'::jsonb,
 0, 'Resource tags are metadata labels appended to cloud resources to streamline billing categorization, cost center attribution, and operational automation.', 'Describe governance: Cost and resource tagging'),

('a0000001-0000-0000-0000-000000000044', 'DOM-SECURITY', 'Associate',
 'How does Role-Based Access Control (RBAC) restrict access to cloud resources?',
 '["By granting all employees full administrative privileges across subscriptions", "By assigning specific roles with defined permission scopes to users, groups, or service principals", "By checking the physical hardware serial number of the user workstation", "By rotating WiFi router passwords daily"]'::jsonb,
 1, 'RBAC assigns granular permission bundles (such as Reader, Contributor, or Owner) to authenticated identities scoped to specific resource groups or subscriptions.', 'Describe identity and access: RBAC'),

('a0000001-0000-0000-0000-000000000045', 'DOM-SECURITY', 'Advanced',
 'Which layer of defense in a Defense in Depth strategy includes tools such as Web Application Firewalls (WAF) and DDoS protection shields?',
 '["Physical Security Layer", "Perimeter Security Layer", "Data Encryption Layer", "Compute OS Layer"]'::jsonb,
 1, 'The perimeter layer defends public network boundaries against volumetric denial-of-service floods and application-layer web exploits before reaching compute nodes.', 'Describe defense in depth'),

('a0000001-0000-0000-0000-000000000046', 'DOM-SECURITY', 'Novice',
 'What type of cloud tool provides continuous visibility into real-time operational spending and sends automated alerts when billing reaches 80% of monthly budget limits?',
 '["Cloud Cost Management & Budgets", "Network Packet Sniffer", "Security Key Vault", "Container Registry"]'::jsonb,
 0, 'Cloud Cost Management utilities monitor current burn rates, forecast end-of-month spend, and notify stakeholders when budget thresholds are breached.', 'Describe cost management tools'),

('a0000001-0000-0000-0000-000000000047', 'DOM-SECURITY', 'Associate',
 'What protection prevents inadvertent deletion of critical cloud production databases by administrators or automated scripts?',
 '["Resource Locks (e.g. ReadOnly or CanNotDelete)", "Network Security Group Deny All", "DNS Pointer Records", "Cost Allocation Rules"]'::jsonb,
 0, 'Resource Locks prohibit accidental deletion or unauthorized modification of critical resources, requiring explicit lock removal before delete operations.', 'Describe governance: Resource locks'),

('a0000001-0000-0000-0000-000000000048', 'DOM-SECURITY', 'Advanced',
 'What mechanism enables a cloud consumer to query relational database tables while guaranteeing that unauthorized administrators or compromised applications cannot view raw data rows belonging to other candidates?',
 '["Client-Side Form Validation", "PostgreSQL Row Level Security (RLS)", "Unencrypted Shared Database Views", "Simple Browser Cookies"]'::jsonb,
 1, 'Row Level Security enforces fine-grained access policies at the database kernel level, filtering rows based on the calling user authenticated security context.', 'Describe security and access controls'),

('a0000001-0000-0000-0000-000000000049', 'DOM-SECURITY', 'Novice',
 'Which encryption standard protects data as it travels across networks between user browsers and cloud load balancers?',
 '["Encryption at Rest (e.g. AES-256)", "Encryption in Transit (e.g. TLS 1.3)", "Data Tokenization", "Plaintext Serialization"]'::jsonb,
 1, 'Encryption in transit uses secure protocols like TLS 1.3 to encrypt data payloads traveling across untrusted public or internal networks.', 'Describe security concepts: Encryption'),

('a0000001-0000-0000-0000-000000000050', 'DOM-SECURITY', 'Associate',
 'An engineer needs to discover unpatched virtual machines, exposed public storage buckets, and overall security posture score across all cloud accounts. What category of tool is used?',
 '["Cloud Security Posture Management (CSPM)", "Container Base Image", "Command Line Shell", "Static Website Generator"]'::jsonb,
 0, 'Cloud Security Posture Management tools continuously audit cloud configurations against security benchmarks, providing compliance scores and remediation guidance.', 'Describe security tools: Posture management'),

('a0000001-0000-0000-0000-000000000051', 'DOM-SECURITY', 'Advanced',
 'What is the role of an automated SIEM / SOAR platform in modern cloud security operations?',
 '["Host static documentation websites", "Aggregate security event logs from multiple services, detect threats via correlation rules, and automate incident response", "Issue invoices for cloud resource compute hours", "Compile TypeScript code into web bundles"]'::jsonb,
 1, 'Security Information and Event Management (SIEM) aggregates multi-service logs, analyzes threats in real-time, and triggers automated orchestration response playbooks.', 'Describe security monitoring tools'),

('a0000001-0000-0000-0000-000000000052', 'DOM-SECURITY', 'Associate',
 'Under data sovereignty regulations (e.g. GDPR), what primary criterion dictates where customer data files must be physically stored?',
 '["The geographic location of the company headquarters only", "The legal jurisdiction and geographic residency boundaries defined by regional regulations", "The cloud provider global pricing table", "The speed of the network router"]'::jsonb,
 1, 'Data residency and sovereignty requirements mandate that customer records reside within designated geopolitical borders to comply with regional privacy laws.', 'Describe compliance and governance')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Default Feature Flags
INSERT INTO feature_flags (flag_name, is_enabled, owner_role, kill_switch_behavior)
VALUES
  ('ff_progressive_hint_ladder', true, 'Product Owner', 'Disables hint trigger button, hides hint drawer, and locks maximum score calculation to 100 with 0 deductions permitted.'),
  ('ff_export_audit_log', true, 'Security Proctor', 'Replaces download button with disabled state badge reading "Audit Export Disabled by Proctor Policy".'),
  ('ff_interactive_node_drag', false, 'Frontend Lead', 'Pins all SVG topology nodes to static mathematical grid coordinates, preventing mouse coordinate updates during rendering stutter.'),
  ('ff_strict_timer_enforcement', true, 'Exam Proctor', 'Automatically fails the scenario session when elapsed time exceeds 600 seconds, setting score to 0 and locking patch inputs.'),
  ('ff_reference_patch_shortcut', true, 'Demo Lead', 'Hides Ctrl+Shift+D fast-remediate keyboard listener and debug button, preventing accidental solution injection during judge hands-on review.'),
  ('ff_edge_packet_animation', true, 'UI Designer', 'Halts CSS SVG stroke-dashoffset packet animations, reducing GPU render load to zero on low-spec client machines.')
ON CONFLICT (flag_name) DO NOTHING;
