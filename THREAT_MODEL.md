# Rehearsal — Threat Model

## Purpose

Rehearsal exists to reduce the chance that autonomous computer-use agents create harmful real-world state. This document defines what the MVP protects against, what it assumes, and what it explicitly does **not** claim to solve.

The project should avoid vague "AI safety" claims. Rehearsal protects a narrow boundary:

> **A consequential action should not be committed until its semantic consequence has been checked at an appropriate safety level.**

## Assets We Protect

Depending on the workflow, protected assets may include:

- money,
- external communications,
- user/customer records,
- files and backups,
- permissions and access,
- official submissions,
- bookings and commitments,
- business configuration.

## Primary Failure Modes

### 1. Wrong Entity

The agent acts on the wrong person, vendor, file, account, or record.

Example:

```text
requested: Sarah Andrews
selected:  Sarah Anderson
```

### 2. Wrong Value

The action is semantically correct but contains an incorrect amount, date, currency, quantity, or identifier.

### 3. Stale or Conflicting State

The agent acts on information that no longer matches the current system or independent evidence.

### 4. UI Misinterpretation

The interface changes or contains an unexpected modal, causing the agent to perform a different action than intended.

### 5. Duplicate Commit

The agent repeats an irreversible action such as payment, submission, or deletion.

### 6. Excessive Blast Radius

The intended operation targets one resource but the actual proposed action affects many.

Example:

```text
intent: remove one user from finance-admin
actual: delete finance-admin group
```

### 7. False External Commitment

The agent sends or publishes a statement that claims a state transition that has not happened.

Example:

```text
message: "Your refund has been approved."
backend: refund_status = pending
```

### 8. Novel Workflow State

The agent enters a state that differs meaningfully from previously validated workflows and continues with unjustified confidence.

## Trust Model

### Untrusted

- LLM-generated plans,
- LLM-generated Action Manifest fields before validation,
- UI interpretation,
- external webpage content,
- agent confidence claims.

### More Trusted

- deterministic invariant checks,
- explicitly configured constraints,
- independent reference data,
- structured application state where available,
- Rehearsal event history.

"More trusted" does not mean infallible; it means these sources should not be silently replaced by agent inference.

## Core Safety Invariants

### Protected Commit Invariant

A protected consequential action must not execute while its Rehearsal decision is pending or failed.

### Evidence Separation Invariant

Reference evidence used to verify a proposed action must remain distinguishable from the agent's own derived state.

### Explainability Invariant

A blocked/escalated action must identify the concrete failed rule/evidence comparison. "AI thinks this is unsafe" is insufficient.

### Demo Safety Invariant

The challenge demo must not execute real financial, legal, destructive, or otherwise consequential actions against third-party systems.

## Fail-Open vs Fail-Closed

The system should distinguish ordinary and protected actions.

- Reversible/low-risk operations may fail open where appropriate.
- Protected commit actions should fail closed if Rehearsal cannot complete its required evaluation.

Example:

```text
page read fails         → retry / continue safely
risk evaluator unavailable before payment → DO NOT COMMIT
```

## Risks Introduced by Rehearsal

Rehearsal itself can create problems.

### False Positive

A safe action is blocked.

Impact: friction, delayed work.

Mitigation:

- transparent reasons,
- selective protection,
- configurable thresholds,
- future earned-autonomy model.

### False Negative

An unsafe action is allowed.

Impact: potentially consequential.

Mitigation:

- deterministic invariants for critical fields,
- independent evidence,
- fail-closed on missing critical evidence,
- explicit scope limitations.

### Manifest Extraction Error

The safety layer misunderstands the proposed action.

Mitigation:

- validate manifest schema,
- cross-check against observable state,
- surface critical extracted fields in the decision report.

### Evidence Poisoning / Bad Reference Data

The independent evidence itself is wrong or malicious.

Mitigation for MVP:

- use controlled synthetic evidence,
- track evidence provenance,
- avoid claiming global correctness.

### Added Latency

Rehearsal slows workflows.

Mitigation:

- trigger only at consequential boundaries,
- prepare evidence speculatively,
- choose the cheapest sufficient safety level.

## Explicit Non-Claims

Rehearsal does not claim to:

- guarantee that an action is safe,
- detect all fraud,
- replace authorization systems,
- replace human judgment in critical regulated domains,
- clone third-party backend state,
- make external irreversible actions reversible,
- provide legal compliance certification.

## Security Principle

> **The safety layer should be strongest exactly where the cost of being wrong stops being local and reversible.**
