"""Aurelia Global Bank — synthetic data generators (seeded, reproducible).
Everything here is invented. No real customer, bank or person is represented."""
import numpy as np, pandas as pd

FIRST = ["Aarav","Maya","Liam","Sofia","Noah","Priya","Lucas","Amara","Ethan","Zara",
         "Oliver","Ines","Mateo","Hana","Felix","Nadia","Arjun","Clara","Tomas","Leila"]
LAST  = ["Fernandes","Okafor","Novak","Hansen","Rao","Silva","Kaur","Brandt","Costa","Iyer",
         "Moreau","Petrov","Nakamura","Ahmed","Olsen","Mehta","Weber","Rossi","Tan","Haddad"]

def loan_book(n=40_000, seed=11):
    r = np.random.default_rng(seed)
    age = np.clip(r.normal(39, 11, n), 21, 75).round()
    income = np.round(r.lognormal(10.75, 0.55, n), -2)             # annual, EUR
    tenure_m = r.integers(3, 240, n)
    util = np.clip(r.beta(2.0, 3.2, n), 0, 1)
    dti = np.clip(r.beta(2.2, 4.5, n) * 0.9, 0.02, 0.85)
    late_12m = r.poisson(0.5, n)
    inquiries = r.poisson(1.1, n)
    amount = np.round(r.lognormal(9.3, 0.7, n), -2)
    grp = r.choice(["A", "B"], n, p=[0.68, 0.32])                   # protected attr (synthetic)
    income = np.where(grp == "B", income * 0.82, income)            # structural income gap (proxy!)
    util = np.clip(np.where(grp == "B", util + 0.06, util), 0, 1)   # and a utilization gap
    z = (-3.15 + 1.6*dti + 1.1*util + 0.5*late_12m + 0.2*inquiries
         - 0.000012*income - 0.004*tenure_m
         + 2.6*util*dti + 0.35*np.maximum(late_12m-1, 0)**1.5       # interactions: GB territory
         + r.normal(0, 0.5, n))
    default = (1/(1+np.exp(-z)) > r.random(n)).astype(int)
    return pd.DataFrame(dict(age=age, income=income, tenure_m=tenure_m, utilization=util.round(3),
                             dti=dti.round(3), late_12m=late_12m, inquiries=inquiries,
                             amount=amount, group=grp, default=default))

def card_stream(n=120_000, seed=42):
    r = np.random.default_rng(seed)
    fraud = r.random(n) < 0.0035
    df = pd.DataFrame({
        "amount": np.where(fraud, r.lognormal(4.6, 1.2, n), r.lognormal(3.9, 1.0, n)),
        "hour": np.where(fraud, r.choice(24, n, p=np.r_[np.full(6, .06), np.full(18, .64/18)]),
                          r.integers(0, 24, n)),
        "mcc_risk": np.clip(np.where(fraud, r.beta(3.2, 2.6, n), r.beta(2, 3.4, n)), 0, 1),
        "dist_km": np.where(fraud, r.exponential(700, n), r.exponential(120, n)),
        "velocity_1h": np.where(fraud, r.poisson(1.6, n), r.poisson(0.4, n)),
        "device_new": np.where(fraud, r.random(n) < .30, r.random(n) < .09).astype(int),
        "is_fraud": fraud.astype(int)})
    return df

def wires(n=25_000, seed=7):
    r = np.random.default_rng(seed)
    susp = r.random(n) < 0.006
    amt = np.where(susp, r.choice([9500, 9800, 9900, 14500], n), r.lognormal(8.2, 1.3, n))
    hops = np.where(susp, r.integers(3, 7, n), r.integers(1, 3, n))
    corridors = ["EU-EU", "EU-US", "EU-APAC", "EU-HIGHRISK"]
    cor = np.where(susp, r.choice(corridors, n, p=[.1, .2, .2, .5]),
                   r.choice(corridors, n, p=[.55, .25, .17, .03]))
    burst_24h = np.where(susp, r.poisson(5, n), r.poisson(0.7, n))
    new_payee = np.where(susp, r.random(n) < .7, r.random(n) < .2).astype(int)
    return pd.DataFrame(dict(amount=np.round(amt, 2), hops=hops, corridor=cor,
                             burst_24h=burst_24h, new_payee=new_payee, suspicious=susp.astype(int)))

def sanctions_list(seed=3):
    r = np.random.default_rng(seed)
    names = [f"{r.choice(FIRST)} {r.choice(LAST)}" for _ in range(60)]
    names += ["Viktor Ziani-Petrov", "Amal K. Haddad", "T. Nakamura-Olsen"]
    return sorted(set(names))

def onboarding_names(n=400, seed=5):
    r = np.random.default_rng(seed)
    out = []
    sl = sanctions_list()
    for i in range(n):
        if r.random() < 0.02:                     # true hits, sometimes misspelt
            nm = sl[r.integers(0, len(sl))]
            if r.random() < 0.5:
                nm = nm.replace("a", "e", 1) if "a" in nm else nm + "n"
        else:
            nm = f"{r.choice(FIRST)} {r.choice(LAST)}"
        out.append(nm)
    return out

COMPLAINT_TOPICS = {
 "fees":      ["charged twice for annual fee", "fee not disclosed before transfer",
               "overdraft fee after salary credit delay", "unexpected maintenance charge on dormant account"],
 "fraud":     ["unauthorized card transaction not refunded", "account emptied after phishing call",
               "disputed transaction closed without explanation"],
 "service":   ["branch wait over two hours", "call center disconnected three times",
               "advisor never returned my call", "app login fails every morning"],
 "lending":   ["loan rejected with no reason given", "rate increased without notice",
               "prepayment penalty was never explained"],
 "conduct":   ["was sold insurance I did not ask for", "pressured into premium account upgrade",
               "elderly parent signed product she did not understand"]}

def complaints(n=6_000, seed=9):
    r = np.random.default_rng(seed)
    topics = list(COMPLAINT_TOPICS)
    rows = []
    month_weights = {"fees": [1,1,1,1,1,1,1,1,1,1.4,1.8,2.2],   # fee complaints ramp (planted trend)
                     "fraud":[1]*12, "service":[1]*12, "lending":[1]*12, "conduct":[1]*12}
    for i in range(n):
        t = topics[r.integers(0, len(topics))]
        w = np.array(month_weights[t], float); w /= w.sum()
        m = int(r.choice(12, p=w))
        txt = COMPLAINT_TOPICS[t][r.integers(0, len(COMPLAINT_TOPICS[t]))]
        sev = int(np.clip(r.normal({"fraud": 3.6, "conduct": 3.4}.get(t, 2.3), 0.8), 1, 5))
        rows.append((f"C{i:05d}", m+1, t, sev, txt))
    return pd.DataFrame(rows, columns=["id", "month", "topic", "severity", "text"])

POLICY_DOCS = {
 "POL-114 Gifts & Entertainment": [
   "Employees must not accept gifts above EUR 150 in value from any client or vendor.",
   "Any gift above EUR 150 must be declined or surrendered to Compliance within 5 business days.",
   "Cash gifts of any amount are prohibited and must be reported to Compliance immediately.",
   "Entertainment such as meals is permitted when business-related and below EUR 250 per person."],
 "POL-203 Customer Complaints": [
   "All complaints must be acknowledged within 2 business days of receipt.",
   "Complaints involving suspected fraud must be escalated to Financial Crime within 24 hours.",
   "A final response must be issued within 15 business days, or 35 for complex cases with interim updates.",
   "Complaints mentioning vulnerability indicators must be routed to the specialist care team."],
 "POL-310 Model Risk": [
   "Every model in production must have a named owner, a model card, and an annual review date.",
   "Tier 1 models require independent validation before first use and after material changes.",
   "Model performance must be monitored against thresholds agreed at approval.",
   "Generative AI systems are governed under POL-311, not under this policy."],
 "POL-311 AI and Generative AI Use": [
   "Customer-facing AI systems require human review of outputs until a waiver is granted by the AI Council.",
   "Confidential data must not be entered into external AI tools that are not on the approved register.",
   "All AI use cases must pass intake risk tiering before any build begins.",
   "AI incidents must be reported to the AI Council within 24 hours of detection."]}
