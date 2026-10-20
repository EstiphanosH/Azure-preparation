import { ScenarioDefinition } from './types.ts';

export const SCENARIO_CATALOG: ScenarioDefinition[] = [
  {
    id: 'SCN-01',
    title: 'Broken Private Ingress Route & Listener Mismatch',
    difficulty: 'Associate',
    description: 'A synthetic multi-tier web topology fails incoming health checks. Diagnostic probes indicate traffic is dropped at the public ingress listener and internal application subnet routes.',
    objective: '1) Reconfigure public load balancer listener to port 443. 2) Update private subnet route table target from blackhole to the active NAT gateway.',
    nodes: [
      {
        id: 'igw-01',
        name: 'Internet Gateway',
        type: 'gateway',
        x: 80,
        y: 190,
        status: 'healthy',
        config: {
          cidr_block: '0.0.0.0/0',
          state: 'attached',
          bandwidth_limit_mbps: 10000,
        },
      },
      {
        id: 'alb-public-01',
        name: 'Public Load Balancer',
        type: 'load_balancer',
        x: 280,
        y: 190,
        status: 'misconfigured',
        config: {
          listener_port: 8080, // Defect 1: should be 443
          ingress_security_group: 'sg-web-public',
          ssl_policy: 'TLS-1.3-Strict',
          health_check_path: '/healthz',
        },
      },
      {
        id: 'subnet-app-private',
        name: 'Private App Subnet',
        type: 'subnet',
        x: 510,
        y: 190,
        status: 'misconfigured',
        config: {
          cidr_block: '10.0.2.0/24',
          route_target: 'blackhole', // Defect 2: should be nat-gateway-01
          nacl_inbound: 'ALLOW_ALL',
          instance_count: 4,
        },
      },
      {
        id: 'db-cluster-01',
        name: 'Database Cluster',
        type: 'database',
        x: 740,
        y: 190,
        status: 'healthy',
        config: {
          engine: 'PostgreSQL-Compatible-Synthetic',
          port: 5432,
          storage_gb: 500,
          multi_az: true,
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        from: 'igw-01',
        to: 'alb-public-01',
        label: 'HTTPS / 443',
        protocol: 'TCP',
        port: 443,
        status: 'blocked',
      },
      {
        id: 'edge-2',
        from: 'alb-public-01',
        to: 'subnet-app-private',
        label: 'App Traffic',
        protocol: 'TCP',
        port: 80,
        status: 'blocked',
      },
      {
        id: 'edge-3',
        from: 'subnet-app-private',
        to: 'db-cluster-01',
        label: 'Internal SQL',
        protocol: 'TCP',
        port: 5432,
        status: 'active',
      },
    ],
    rules: [
      {
        id: 'RULE-ERR-01',
        title: 'Public Load Balancer Ingress Port',
        description: 'Public load balancer listener port must match client HTTPS target 443.',
        targetNodeId: 'alb-public-01',
        severity: 'CRITICAL',
        validate: (nodes) => {
          const alb = nodes['alb-public-01'];
          if (!alb) return { passed: false, message: 'Node alb-public-01 missing from topology.' };
          const port = alb.config.listener_port;
          const passed = port === 443;
          return {
            passed,
            message: passed
              ? 'Listener configured to standard secure port 443.'
              : `Ingress listener port is set to ${port}; expected 443.`,
          };
        },
      },
      {
        id: 'RULE-ERR-02',
        title: 'Private Subnet Default Route',
        description: 'Private subnet routing table must forward default outbound egress (0.0.0.0/0) to nat-gateway-01.',
        targetNodeId: 'subnet-app-private',
        severity: 'CRITICAL',
        validate: (nodes) => {
          const subnet = nodes['subnet-app-private'];
          if (!subnet) return { passed: false, message: 'Node subnet-app-private missing.' };
          const target = subnet.config.route_target;
          const passed = target === 'nat-gateway-01';
          return {
            passed,
            message: passed
              ? 'Route target properly routed through nat-gateway-01.'
              : `Route target is misconfigured as '${target}'. Packets dropped in blackhole route.`,
          };
        },
      },
      {
        id: 'RULE-INFO-03',
        title: 'Database Cluster High Availability',
        description: 'Relational data tier must maintain multi-AZ replication redundancy for resilience.',
        targetNodeId: 'db-cluster-01',
        severity: 'MEDIUM',
        validate: (nodes) => {
          const db = nodes['db-cluster-01'];
          const passed = !!db?.config?.multi_az;
          return {
            passed,
            message: passed ? 'Multi-AZ replication active.' : 'Database cluster is single-zone.',
          };
        },
      },
    ],
    hints: [
      {
        tier: 1,
        penaltyPoints: 10,
        title: 'Inspect Ingress Edge',
        guidance: 'Inspect alb-public-01. Notice the edge requires port 443, but the listener configuration has been diverted.',
      },
      {
        tier: 2,
        penaltyPoints: 10,
        title: 'Inspect Egress Route Table',
        guidance: 'Check subnet-app-private route_target. A blackhole target prevents outbound packet translation.',
      },
      {
        tier: 3,
        penaltyPoints: 10,
        title: 'Exact Remediation Values',
        guidance: 'Set alb-public-01 listener_port to 443, and set subnet-app-private route_target to nat-gateway-01.',
      },
    ],
  },
];
