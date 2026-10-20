import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '1m', target: 50 },
    { duration: '1m30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

export default function () {
  const uniqueId = `${__VU}_${__ITER}_${Date.now()}`;
  const email = `load_candidate_${uniqueId}@cloudfix.edu`;
  const password = 'P@sswordEnterprise2026!';

  // 1. Register candidate
  const regPayload = JSON.stringify({
    email,
    password,
    username: `usr_${uniqueId.substring(0, 10)}`,
    fullName: 'Load Test Candidate',
  });

  const regRes = http.post(`${BASE_URL}/api/auth/register`, regPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(regRes, {
    'register status is 200': (r) => r.status === 200,
    'has access token': (r) => JSON.parse(r.body).accessToken !== undefined,
  });

  if (regRes.status !== 200) {
    return;
  }

  const token = JSON.parse(regRes.body).accessToken;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Start Diagnostic Session
  const sessionPayload = JSON.stringify({
    domainId: 'DOM-CONCEPTS',
    mode: 'Standard',
  });

  const sessionRes = http.post(`${BASE_URL}/api/quiz/sessions`, sessionPayload, {
    headers: authHeaders,
  });

  check(sessionRes, {
    'session start status is 201': (r) => r.status === 201,
  });

  if (sessionRes.status !== 201) {
    return;
  }

  const sessionId = JSON.parse(sessionRes.body).id;

  // 3. Submit 20 answers in succession
  for (let i = 1; i <= 20; i++) {
    const questionId = `Q-${(i % 5) + 1}`;
    const attemptPayload = JSON.stringify({
      sessionId,
      questionId,
      selectedIndex: (i % 4),
      timeTakenMs: 1200 + Math.floor(Math.random() * 500),
    });

    const attemptRes = http.post(`${BASE_URL}/api/quiz/attempts`, attemptPayload, {
      headers: authHeaders,
    });

    check(attemptRes, {
      'attempt submission status is 200': (r) => r.status === 200,
    });
  }

  // 4. Finalize & Submit Session
  const finalizePayload = JSON.stringify({
    sessionId,
  });

  const finalizeRes = http.post(`${BASE_URL}/api/quiz/sessions/${sessionId}/finalize`, finalizePayload, {
    headers: authHeaders,
  });

  check(finalizeRes, {
    'finalize status is 200': (r) => r.status === 200,
    'session scored': (r) => JSON.parse(r.body).status === 'Completed',
  });

  // 5. Evaluate Readiness
  const readinessRes = http.get(`${BASE_URL}/api/readiness`, {
    headers: authHeaders,
  });

  check(readinessRes, {
    'readiness status is 200': (r) => r.status === 200,
    'readiness has overallScore': (r) => JSON.parse(r.body).overallScore !== undefined,
  });

  sleep(0.5);
}
