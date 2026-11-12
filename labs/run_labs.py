"""Execute every lab in a clean process order and cache stdout to build/labout/<name>.txt"""
import io, sys, contextlib, os, traceback
sys.path.insert(0, os.path.dirname(__file__))
import labs_ml, labs_fraud_nlp, labs_genai_platform

LABS = {
 "lab05_first_model": labs_ml.lab05_first_model,
 "lab05_forecast": labs_ml.lab05_forecast,
 "lab07_data_quality": labs_ml.lab07_data_quality,
 "lab09_credit": labs_ml.lab09_credit,
 "lab10_fairness": labs_ml.lab10_fairness,
 "lab11_fraud": labs_fraud_nlp.lab11_fraud,
 "lab12_aml": labs_fraud_nlp.lab12_aml,
 "lab13_kyc": labs_fraud_nlp.lab13_kyc,
 "lab14_screening_qa": labs_fraud_nlp.lab14_screening_qa,
 "lab15_complaints": labs_fraud_nlp.lab15_complaints,
 "lab17_rag": labs_genai_platform.lab17_rag,
 "lab18_eval": labs_genai_platform.lab18_eval,
 "lab19_agent": labs_genai_platform.lab19_agent,
 "lab20_capacity": labs_genai_platform.lab20_capacity,
 "lab21_llmcost": labs_genai_platform.lab21_llmcost,
 "lab22_serve_drift": labs_genai_platform.lab22_serve_drift,
 "lab23_redteam": labs_genai_platform.lab23_redteam,
 "lab25_vendor": labs_genai_platform.lab25_vendor,
 "lab28_portfolio": labs_genai_platform.lab28_portfolio,
}

out_dir = os.path.join(os.path.dirname(__file__), "..", "build", "labout")
os.makedirs(out_dir, exist_ok=True)
fails = []
for name, fn in LABS.items():
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            fn()
        open(os.path.join(out_dir, name + ".txt"), "w").write(buf.getvalue())
        print(f"ok   {name}  ({len(buf.getvalue().splitlines())} lines)")
    except Exception:
        fails.append(name)
        print(f"FAIL {name}"); traceback.print_exc()
print("FAILED:", fails if fails else "none")
