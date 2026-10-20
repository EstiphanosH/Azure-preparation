# Domain Specification: Readiness Scoring Algorithm

## 1. Mathematical Formulation

The readiness computation is a pure, deterministic function mapping a candidate's attempt history, syllabus question domain metadata, and the current evaluation timestamp to a verified score:

$$\text{ReadinessScore} = f(\text{UserId}, \text{Attempts}, \text{QuestionDomainMap}, T_{\text{eval}})$$

---

## 2. Recency Decay Weighting Function

Older attempts should not carry equal weight to recent diagnostic performance. An exponential decay model with a 14-day half-life is applied to every recorded attempt:

### A. Age Calculation
For attempt $i$ recorded at timestamp $T_i$:
$$A_i = \max\left(0, \frac{T_{\text{eval}} - T_i}{86,400,000 \text{ ms}}\right)$$
where $A_i$ is the elapsed age in decimal days.

### B. Recency Decay Factor ($w_i$)
$$w_i = 0.5^{\frac{A_i}{T_{\text{half}}}}$$
where $T_{\text{half}} = 14.0 \text{ days}$.
- An attempt submitted today ($A_i = 0$): $w_i = 0.5^0 = 1.0$.
- An attempt submitted 14 days ago ($A_i = 14$): $w_i = 0.5^1 = 0.50$.
- An attempt submitted 28 days ago ($A_i = 28$): $w_i = 0.5^2 = 0.25$.

---

## 3. Multi-Domain Weighted Aggregation

The syllabus domains are weighted according to official public foundational syllabus domain weightings:

| Domain ID | Syllabus Domain Title | Assigned Weight ($W_d$) | Weight Range in Syllabus |
| :--- | :--- | :--- | :--- |
| **`DOM-CONCEPTS`** | Cloud Fundamentals & Architectures | **28%** ($0.28$) | 25% – 30% |
| **`DOM-SERVICES`** | Compute, Storage & Networking Services | **37%** ($0.37$) | 35% – 40% |
| **`DOM-SECURITY`** | Identity, Governance & Compliance Controls | **35%** ($0.35$) | 30% – 35% |
| **Total** | | **100%** ($1.00$) | |

### Domain Accuracy Formula
For domain $d$:
$$\text{Accuracy}_d = \begin{cases} 
\left(\frac{\sum_{i \in d} (w_i \cdot \text{isCorrect}_i)}{\sum_{i \in d} w_i}\right) \times 100, & \text{if } \sum_{i \in d} w_i > 0 \\
0, & \text{if } \sum_{i \in d} w_i = 0 
\end{cases}$$

### Overall Score Formula
$$\text{OverallScore} = \text{round}\left(\sum_{d} W_d \times \text{Accuracy}_d\right)$$
clamped strictly within integer bounds $[0, 100]$.

---

## 4. Evaluation Grade Decision Thresholds

| Evaluation Grade | Threshold Criteria | Candidate Next Step |
| :--- | :--- | :--- |
| **`READY`** | **OverallScore ≥ 70%** AND **Every Individual Domain ≥ 60%** | Candidate possesses holistic architectural competence across all syllabus objectives. |
| **`REVIEW_REQUIRED`** | **OverallScore ≥ 50%** OR any individual domain `< 60%` | Candidate demonstrates core comprehension but displays localized domain deficiency requiring targeted review. |
| **`NOT_READY`** | **OverallScore < 50%** | Candidate requires comprehensive diagnostic revision across multiple syllabus areas. |

---

## 5. Purity, Determinism, and Performance Guarantee
1. **Zero Side-Effects**: Operates solely over in-memory parameter arguments.
2. **Determinism Invariant**: 100 identical executions over the same data fixture produce 100 byte-identical JSON outputs.
3. **Execution Latency**: Evaluates 100 historical attempts in ≤ 2.5 milliseconds.
