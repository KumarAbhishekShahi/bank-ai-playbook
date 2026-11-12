"""Labs for Part IV (fraud/AML) and Parts V-VI (NLP)."""
import numpy as np, pandas as pd, re
import agb_data as agb
from sklearn.ensemble import HistGradientBoostingClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score, recall_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from rapidfuzz import fuzz

def lab11_fraud():
    df = agb.card_stream()
    X = df.drop(columns="is_fraud"); y = df["is_fraud"]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=7)
    m = HistGradientBoostingClassifier(max_iter=60, max_depth=3, learning_rate=0.06,
                                       random_state=7).fit(X_tr, y_tr)
    s = m.predict_proba(X_te)[:, 1]
    print(f"transactions scored : {len(y_te):,}")
    print(f"actual fraud cases  : {y_te.sum():,}  ({y_te.mean():.2%})")
    print(f"model AUC           : {roc_auc_score(y_te, s):.3f}")
    print()
    print("alerts/day  threshold  precision  recall  fraud caught")
    for budget in (50, 100, 200, 400):
        k = int(budget * len(y_te) / len(df))
        order = np.argsort(s)[::-1]
        flag = np.zeros_like(y_te, dtype=bool); flag[order[:k]] = True
        p = precision_score(y_te, flag); r = recall_score(y_te, flag)
        print(f"{budget:>9}   {s[order[k-1]]:.3f}     {p:5.1%}    {r:5.1%}   {int(flag[y_te==1].sum()):>4} of {y_te.sum()}")

def lab12_aml():
    df = agb.wires()
    rules = (((df.amount.between(9000, 9999)) & (df.new_payee == 1)) |
             (df.corridor.eq("EU-HIGHRISK") & (df.burst_24h >= 3)) |
             (df.hops >= 4) & (df.amount > 8000))
    feats = pd.get_dummies(df[["amount", "hops", "burst_24h", "new_payee", "corridor"]])
    iso = IsolationForest(n_estimators=150, contamination=0.01, random_state=7).fit(feats)
    anom = iso.predict(feats) == -1
    alerts = rules | anom
    y = df["suspicious"].astype(bool)
    tp = (alerts & y).sum()
    print(f"wires screened      : {len(df):,}   truly suspicious: {int(y.sum())}")
    print(f"rule alerts         : {int(rules.sum()):>4}  (catch {int((rules&y).sum())})")
    print(f"anomaly alerts      : {int(anom.sum()):>4}  (catch {int((anom&y).sum())}, overlap {int((rules&anom&y).sum())})")
    print(f"combined queue      : {int(alerts.sum()):>4}  precision {tp/alerts.sum():5.1%}  recall {tp/y.sum():5.1%}")
    inv = int(alerts.sum() * 0.85); sar = int(tp * 0.6)
    print(f"SAR funnel          : {int(alerts.sum())} alerts -> {inv} investigated -> {sar} SARs filed")
    print("note: AML success is measured on the funnel and audit trail, not AUC.")

def lab13_kyc():
    names = agb.onboarding_names()
    wl = agb.sanctions_list()
    hits = []
    for nm in names:
        best = max(wl, key=lambda w: fuzz.token_sort_ratio(nm, w))
        sc = fuzz.token_sort_ratio(nm, best)
        if sc >= 86: hits.append((nm, best, sc))
    print(f"applicants screened : {len(names)}   watchlist size: {len(wl)}")
    print(f"potential matches   : {len(hits)} (threshold 86, token-sort fuzzy)")
    print()
    print("applicant name            matched list entry        score  disposition")
    for nm, best, sc in sorted(hits, key=lambda t: -t[2])[:6]:
        disp = "ESCALATE L2" if sc >= 93 else "analyst review"
        print(f"{nm:<25} {best:<25} {sc:>4.0f}   {disp}")
    doc = "Customer: Amara  COSTA | DOB 12-04-1988 | Passport X4411902 | Address: 14 Brunnenstr, Berlin"
    m = dict(re.findall(r"(Customer|DOB|Passport|Address):?\s*([^|]+)", doc))
    print()
    print("field extraction from onboarding doc:")
    for k, v in m.items(): print(f"  {k:<9}-> {v.strip()}")

def lab14_screening_qa():
    r = np.random.default_rng(17)
    n_cleared = 5000
    sample = 200
    seeded_errors = 7          # planted mistakes in the cleared pile
    found = r.hypergeometric(seeded_errors, n_cleared - seeded_errors, sample)
    err_rate = found / sample
    print(f"cleared screenings  : {n_cleared:,}   QA sample: {sample}")
    print(f"errors found in QA  : {found}   observed error rate {err_rate:.1%}")
    lo, hi = max(0, err_rate - 1.96*np.sqrt(err_rate*(1-err_rate)/sample)), err_rate + 1.96*np.sqrt(err_rate*(1-err_rate)/sample)
    print(f"95% interval        : {lo:.1%} - {hi:.1%} -> projected {int(lo*n_cleared)}-{int(hi*n_cleared)} errors in cleared pile")
    print("action: above 1% tolerance -> targeted re-review of the affected analyst-week cohorts.")

def lab15_complaints():
    df = agb.complaints()
    X_tr, X_te, y_tr, y_te = train_test_split(df.text, df.topic, test_size=0.3,
                                              stratify=df.topic, random_state=7)
    vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2)
    clf = LogisticRegression(max_iter=1000).fit(vec.fit_transform(X_tr), y_tr)
    acc = clf.score(vec.transform(X_te), y_te)
    print(f"complaints          : {len(df):,}  topics: {df.topic.nunique()}")
    print(f"classifier accuracy : {acc:.1%} (TF-IDF + logistic; holdout)")
    sev = df.groupby("topic").severity.mean().sort_values(ascending=False)
    print("\nmean severity by topic:")
    for t, v in sev.items(): print(f"  {t:<8} {v:.2f}")
    trend = df[df.topic == "fees"].groupby("month").size()
    q4 = trend.loc[10:12].sum(); q1_3 = trend.loc[1:9].sum()/3
    print(f"\nfee complaints, monthly: Q1-Q3 avg {q1_3:.0f}/quarter-month -> Oct-Dec {q4} total")
    print(f"detected trend: fee complaints up {q4/(q1_3*3)-1:+.0%} in Q4 -> conduct-risk flag raised")
    print("regulatory-reportable: fraud + conduct topics auto-tagged for the monthly return.")

if __name__ == "__main__":
    for fn in [lab11_fraud, lab12_aml, lab13_kyc, lab14_screening_qa, lab15_complaints]:
        print(f"== {fn.__name__} =="); fn(); print()
