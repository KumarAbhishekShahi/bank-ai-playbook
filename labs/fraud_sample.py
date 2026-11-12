"""Lab 10.2 -- Scoring under an alert budget (sample-spread version).
Generates AGB synthetic card transactions, trains a gradient-boosted
fraud model, and tunes the threshold to a 200-alerts/day budget.
"""
import numpy as np, pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score, recall_score

rng = np.random.default_rng(42)
N = 120_000                      # one day of card traffic for one portfolio
fraud_rate = 0.0035              # 0.35% of transactions are fraud

# --- synthetic features ------------------------------------------------
is_fraud = rng.random(N) < fraud_rate
amount = np.where(is_fraud,
                  rng.lognormal(4.6, 1.2, N),      # fraud skews higher
                  rng.lognormal(3.9, 1.0, N))
hour = np.where(is_fraud,
                rng.choice(24, N, p=np.r_[np.full(6, .06), np.full(18, .64 / 18)]),
                rng.integers(0, 24, N))
mcc_risk = np.clip(np.where(is_fraud, rng.beta(3.2, 2.6, N), rng.beta(2, 3.4, N)), 0, 1)
dist_km = np.where(is_fraud, rng.exponential(700, N), rng.exponential(120, N))
velocity_1h = np.where(is_fraud, rng.poisson(1.6, N), rng.poisson(0.4, N))
device_new = np.where(is_fraud, rng.random(N) < .30, rng.random(N) < .09)

X = pd.DataFrame({"amount": amount, "hour": hour, "mcc_risk": mcc_risk,
                  "dist_km": dist_km, "velocity_1h": velocity_1h,
                  "device_new": device_new.astype(int)})
y = is_fraud.astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3,
                                          stratify=y, random_state=7)

model = HistGradientBoostingClassifier(max_iter=60, max_depth=3, learning_rate=0.06, random_state=7)
model.fit(X_tr, y_tr)
scores = model.predict_proba(X_te)[:, 1]

print(f"transactions scored : {len(y_te):,}")
print(f"actual fraud cases  : {y_te.sum():,}  ({y_te.mean():.2%})")
print(f"model AUC           : {roc_auc_score(y_te, scores):.3f}")
print()
print("alerts/day  threshold  precision  recall  fraud caught")
for budget in (50, 100, 200, 400):
    k = int(budget * len(y_te) / N)          # scale budget to test slice
    order = np.argsort(scores)[::-1]
    flag = np.zeros_like(y_te, dtype=bool); flag[order[:k]] = True
    thr = scores[order[k - 1]]
    p = precision_score(y_te, flag); r = recall_score(y_te, flag)
    print(f"{budget:>9}   {thr:.3f}     {p:5.1%}    {r:5.1%}   {int(flag[y_te==1].sum()):>4} of {y_te.sum()}")
