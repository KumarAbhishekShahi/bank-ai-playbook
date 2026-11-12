# AI Incident Runbook
**Incident:** AI behaviour that caused or could cause harm (wrong output acted on, bias pattern, data exposure, out-of-scope agent action, successful attack).
**Severity:** S1 harm/regulatory in progress → war room now · S2 contained but real → same-day · S3 near-miss → weekly review. 24h internal reporting, always.
**Steps:** Contain (banner/route/disable; reproduce in eval harness) → Assess blast radius from audit logs → Communicate facts-first (4-line brief: what, exposure, containment, next update) → Remediate + add regression tests to golden set → Blameless postmortem (timeline, plural causes, owned actions) → Register + risk log.
**Rule:** thank reporters by name. Reporting culture is a control.
