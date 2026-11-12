"""Labs for Part II (foundations) and Part III (credit risk)."""
import numpy as np, pandas as pd
import agb_data as agb
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, brier_score_loss
from sklearn.inspection import permutation_importance

FEATS = ["age", "income", "tenure_m", "utilization", "dti", "late_12m", "inquiries", "amount"]

def _split(df):
    X, y = df[FEATS], df["default"]
    return train_test_split(X, y, test_size=0.3, stratify=y, random_state=7)

def ks_gini(y, s):
    order = np.argsort(s)[::-1]
    yy = np.asarray(y)[order]
    cum_bad = np.cumsum(yy) / yy.sum()
    cum_good = np.cumsum(1 - yy) / (len(yy) - yy.sum())
    ks = float(np.max(np.abs(cum_bad - cum_good)))
    gini = 2 * roc_auc_score(y, s) - 1
    return ks, gini

def lab05_first_model():
    df = agb.loan_book()
    X_tr, X_te, y_tr, y_te = _split(df)
    sc = StandardScaler().fit(X_tr)
    lr = LogisticRegression(max_iter=500).fit(sc.transform(X_tr), y_tr)
    s = lr.predict_proba(sc.transform(X_te))[:, 1]
    auc = roc_auc_score(y_te, s); ks, gini = ks_gini(y_te, s)
    print(f"loans scored        : {len(y_te):,}   default rate {y_te.mean():.1%}")
    print(f"logistic regression : AUC {auc:.3f} | KS {ks:.3f} | Gini {gini:.3f}")
    naive = float(max(y_te.mean(), 1 - y_te.mean()))
    print(f"'always repay' acc  : {naive:.1%}  <- why accuracy misleads at {y_te.mean():.0%} prevalence")

def lab05_forecast():
    r = np.random.default_rng(21)
    days = pd.date_range("2026-08-01", periods=98, freq="D")
    base = 180 + 22*np.sin(np.arange(98)*2*np.pi/7) + np.linspace(0, 14, 98)  # weekly + drift
    pay_spike = np.where(days.day.isin([1, 15]), 55, 0)
    demand = np.round(base + pay_spike + r.normal(0, 9, 98), 0)   # ATM cash, thousands EUR
    train, test = demand[:84], demand[84:]
    # seasonal-naive: same weekday last week + trend from last 4 weeks
    trend = (train[-28:].mean() - train[-56:-28].mean()) / 28
    pred = np.array([train[-7 + (i % 7)] + trend*(i+1) for i in range(14)])
    mape = float(np.mean(np.abs((test - pred) / test))) * 100
    naive_mape = float(np.mean(np.abs((test - train[-1]) / test))) * 100
    print("ATM cash demand, one branch cluster (EUR '000/day), 98 days")
    print(f"seasonal-naive+trend forecast, 14-day holdout : MAPE {mape:4.1f}%")
    print(f"flat 'yesterday' baseline                     : MAPE {naive_mape:4.1f}%")
    print("lesson: respect the weekly cycle and paydays before reaching for deep nets")

def lab07_data_quality():
    df = agb.loan_book()
    r = np.random.default_rng(13)
    dirty = df.copy()
    idx = r.choice(len(dirty), 900, replace=False); dirty.loc[idx, "income"] = np.nan
    idx2 = r.choice(len(dirty), 140, replace=False); dirty.loc[idx2, "age"] = 212
    dup = dirty.sample(260, random_state=13); dirty = pd.concat([dirty, dup])
    print(f"rows {len(dirty):,} (source said {len(df):,})")
    print(f"duplicates          : {int(dirty.duplicated().sum()):,}")
    print(f"income nulls        : {dirty['income'].isna().mean():.1%}")
    print(f"age out of range    : {(dirty['age']>100).sum()} rows (max {int(dirty['age'].max())})")
    print(f"dti>0.8 & default=0 : {((dirty.dti>0.8)&(dirty.default==0)).sum()} rows  <- investigate, don't delete")
    print("verdict: NOT model-ready. Fix at source, document lineage, re-profile.")

def lab09_credit():
    df = agb.loan_book()
    X_tr, X_te, y_tr, y_te = _split(df)
    sc = StandardScaler().fit(X_tr)
    lr = LogisticRegression(max_iter=500).fit(sc.transform(X_tr), y_tr)
    gb = HistGradientBoostingClassifier(max_iter=150, max_depth=3, random_state=7).fit(X_tr, y_tr)
    out = []
    for name, s in [("logistic (scorecard)", lr.predict_proba(sc.transform(X_te))[:, 1]),
                    ("gradient boosting  ", gb.predict_proba(X_te)[:, 1])]:
        auc = roc_auc_score(y_te, s); ks, gini = ks_gini(y_te, s)
        br = brier_score_loss(y_te, s)
        out.append((name, auc, ks, gini, br))
    print("model                  AUC     KS     Gini   Brier")
    for n, a, k, g, b in out:
        print(f"{n}  {a:.3f}  {k:.3f}  {g:.3f}  {b:.4f}")
    # scorecard scaling
    pd0 = out[0]
    print()
    print("scorecard: score = 600 + PDO*log2(odds/50:1), PDO=20  ->")
    for p in (0.02, 0.05, 0.12, 0.30):
        odds = (1-p)/p
        score = 600 + 20*np.log2(odds/50)
        print(f"  PD {p:4.0%}  ->  {score:5.0f} points")
    return gb, (X_te, y_te)

def lab10_fairness():
    df = agb.loan_book()
    X = df[FEATS]; y = df["default"]; g = df["group"]
    X_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(X, y, g, test_size=0.3,
                                                          stratify=y, random_state=7)
    gb = HistGradientBoostingClassifier(max_iter=150, max_depth=3, random_state=7).fit(X_tr, y_tr)
    s = gb.predict_proba(X_te)[:, 1]
    thr = np.quantile(s, 0.80)               # approve the best 80%
    approve = s < thr
    ra = approve[g_te.values == "A"].mean(); rb = approve[g_te.values == "B"].mean()
    print(f"approval rate  group A: {ra:.1%}   group B: {rb:.1%}")
    print(f"adverse impact ratio (B/A): {rb/ra:.2f}   (4/5ths rule floor: 0.80)")
    bad_a = y_te[(g_te=='A').values & approve].mean(); bad_b = y_te[(g_te=='B').values & approve].mean()
    print(f"default rate among approved  A: {bad_a:.1%}  B: {bad_b:.1%}")
    imp = permutation_importance(gb, X_te, y_te, n_repeats=5, random_state=7, scoring="roc_auc")
    top = sorted(zip(FEATS, imp.importances_mean), key=lambda t: -t[1])[:4]
    print("top drivers (permutation importance on AUC):")
    for f, v in top: print(f"  {f:<12} {v:+.4f}")
    print("adverse-action reasons for a declined applicant come from these drivers,")
    print("stated in plain language (e.g. 'debt-to-income too high relative to approved range').")

if __name__ == "__main__":
    for fn in [lab05_first_model, lab05_forecast, lab07_data_quality, lab09_credit, lab10_fairness]:
        print(f"== {fn.__name__} =="); fn(); print()
