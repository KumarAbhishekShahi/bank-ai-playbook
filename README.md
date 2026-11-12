# The Bank AI Playbook — Companion Repository

Code, synthetic data generators, templates and solutions for **The Bank AI Playbook**
(Kumar Abhishek Shahi, The Final Leap, 2026). Everything is synthetic and seeded:
your outputs match the book's printed output exactly.

## Setup (Chapter 4)
```bash
pip install -r requirements.txt     # Python 3.12+
python labs/run_labs.py             # executes every lab, caches outputs to build/labout/
```

## Lab index
| Lab | Chapter | File / entry point |
|---|---|---|
| First model + metrics | 5 | `labs/labs_ml.py::lab05_first_model` |
| ATM cash forecast | 5 | `labs/labs_ml.py::lab05_forecast` |
| Data-quality profile | 7 | `labs/labs_ml.py::lab07_data_quality` |
| Credit scorecard vs GB | 9 | `labs/labs_ml.py::lab09_credit` |
| Fairness / proxy-bias audit | 10 | `labs/labs_ml.py::lab10_fairness` |
| Fraud alert budget | 11 | `labs/labs_fraud_nlp.py::lab11_fraud` |
| AML rules + anomaly + SAR funnel | 12 | `labs/labs_fraud_nlp.py::lab12_aml` |
| KYC screening + extraction | 13 | `labs/labs_fraud_nlp.py::lab13_kyc` |
| HITL QA sampling | 14 | `labs/labs_fraud_nlp.py::lab14_screening_qa` |
| Complaints pipeline + trend | 15 | `labs/labs_fraud_nlp.py::lab15_complaints` |
| Policy copilot (RAG core) | 17 | `labs/labs_genai_platform.py::lab17_rag` |
| Golden-set evaluation + gate | 18 | `labs/labs_genai_platform.py::lab18_eval` |
| Gated triage agent | 19 | `labs/labs_genai_platform.py::lab19_agent` |
| Fraud capacity math | 20 | `labs/labs_genai_platform.py::lab20_capacity` |
| GPU vs API cost model | 21 | `labs/labs_genai_platform.py::lab21_llmcost` |
| Serve + PSI drift | 22 | `labs/labs_genai_platform.py::lab22_serve_drift` |
| Red-team: injection + evasion | 23 | `labs/labs_genai_platform.py::lab23_redteam` |
| Vendor scorecard | 29 | `labs/labs_genai_platform.py::lab25_vendor` |
| WSJF portfolio | 28 | `labs/labs_genai_platform.py::lab28_portfolio` |

The RAG core (`PolicyCopilot`) is fully offline and deterministic (TF-IDF retrieval,
extractive citation-first answers). To add an LLM generator, implement the hook in
`labs/labs_genai_platform.py` behind the same three contracts: no citation → no answer;
below floor → refuse; log everything.

## Folders
- `governance-pack/` — model card, CoE charter, intake form, tiering rubric, incident runbook, threshold memo templates
- `interview-prep/` — question bank + five system-design mock briefs
- `solutions/` — discussion notes for end-of-chapter practice

## Disclaimer
Aurelia Global Bank is fictional; all data synthetic; educational use only — not
legal, regulatory or financial advice. See the book's copyright page.
