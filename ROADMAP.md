# Rehearsal — Roadmap

## Guiding Rule

Rehearsal should grow by proving one safety primitive at a time.

Do not add breadth until the primary end-to-end path is convincing.

---

## M0 — Solari Surface Validation

### Goal

Confirm that the fork can use all three Solari surfaces through one API key.

### Tasks

- [ ] Configure `SOLARI_API_KEY` locally.
- [ ] Run Browser quickstart unchanged.
- [ ] Run Sandbox quickstart unchanged.
- [ ] Run Desktop computer-use example unchanged.
- [ ] Document any SDK/runtime gotchas found during setup.

### Exit Criteria

A tiny script for each surface runs successfully and shuts down cleanly.

---

## M1 — Safety Core

### Goal

Build the minimum Rehearsal control plane without any elaborate UI.

### Tasks

- [ ] Define `ActionManifest` schema.
- [ ] Add runtime validation.
- [ ] Define `DIRECT`, `VERIFY`, `REHEARSE`, `ESCALATE`.
- [ ] Implement simple commit-boundary detector.
- [ ] Implement transparent risk scoring.
- [ ] Implement event model/logging.
- [ ] Add unit tests for manifest validation and decision logic.

### Exit Criteria

Given a synthetic proposed action, Rehearsal can classify it and explain which risk signals caused the result.

---

## M2 — Primary AP Scenario

### Goal

Create the synthetic accounts-payable workflow that demonstrates the core idea.

### Tasks

- [ ] Create synthetic invoice data.
- [ ] Create purchase-order/reference data.
- [ ] Create vendor history with intentional bank-account mismatch.
- [ ] Use Solari Sandbox to ingest/normalize evidence.
- [ ] Create a minimal synthetic internal accounting workflow.
- [ ] Drive the internal GUI through Solari Desktop.
- [ ] Create a synthetic payment portal/web flow.
- [ ] Drive it through Solari Browser.
- [ ] Reach `CONFIRM PAYMENT` without committing.

### Exit Criteria

The agent can autonomously progress from invoice ingestion to the final payment confirmation state across the Solari surfaces.

---

## M3 — Consequence Rehearsal

### Goal

Intercept the final payment and stop an unsafe consequence before commit.

### Tasks

- [ ] Generate the payment Action Manifest from live workflow state.
- [ ] Check invoice amount.
- [ ] Check currency.
- [ ] Check vendor identity.
- [ ] Check duplicate-payment state.
- [ ] Check destination account against independent evidence.
- [ ] Block the final commit on critical mismatch.
- [ ] Produce concise evidence-backed explanation.

### Exit Criteria

The browser reaches the final commit boundary, Rehearsal detects the account mismatch, and the payment action is visibly withheld.

This is the **minimum challenge-worthy build**.

---

## M4 — Speculative Preparation

### Goal

Reduce friction by doing safety work before the commit boundary is reached.

### Tasks

- [ ] Start evidence normalization as soon as the relevant invoice is identified.
- [ ] Cache deterministic invariant inputs.
- [ ] Compute checks that do not depend on final UI state in parallel.
- [ ] Measure time from commit detection to final decision.
- [ ] Display which checks were precomputed vs evaluated at boundary.

### Exit Criteria

Most safety work is complete before the agent reaches `CONFIRM PAYMENT`, making the final gate feel near-instant.

---

## M5 — Execution Rehearsal

### Goal

Demonstrate literal rehearsal where the environment is under our control.

### Tasks

- [ ] Create a cloneable local/sandbox-hosted workflow.
- [ ] Capture a known-good safe state.
- [ ] Snapshot/fork the controlled environment.
- [ ] Execute a proposed consequential action in the fork.
- [ ] Inspect the resulting state.
- [ ] Use the result to approve or reject the production commit.

### Exit Criteria

Rehearsal demonstrates both:

1. **Consequence Rehearsal** for non-cloneable external state.
2. **Execution Rehearsal** for controlled cloneable state.

---

## M6 — Second Consequence Domain

### Preferred Scenario: External Communication

Agent prepares a message asserting that a refund has been approved while independent system state says the refund is pending.

### Tasks

- [ ] Add `external_message` Action Manifest type.
- [ ] Detect `SEND` boundary.
- [ ] Extract factual claim from proposed message.
- [ ] Compare claim against system evidence.
- [ ] Block false external commitment.

### Exit Criteria

Reviewers can see that Rehearsal is not a payment-specific checker.

---

## M7 — Minimal Product UI

### Goal

Make the safety behavior visually obvious without burying the project in dashboard work.

### Views

- current agent/task,
- latest proposed action,
- safety level,
- risk signals,
- passed/failed invariants,
- event timeline,
- allowed/blocked state.

### Exit Criteria

A viewer understands why an action was stopped without reading terminal logs.

---

## M8 — Demo, Documentation, and Real Usage

### Goal

Turn the implementation into a strong public challenge submission.

### Tasks

- [ ] Replace fork README with Rehearsal-focused README while preserving attribution to Solari Cookbook.
- [ ] Add architecture diagram.
- [ ] Add 30–60 second GIF/video clip.
- [ ] Add setup instructions.
- [ ] Add `.env.example` without secrets.
- [ ] Add reproducible demo command.
- [ ] Add limitations section.
- [ ] Record polished full demo.
- [ ] Ask a small number of real users/developers to run or watch the workflow and collect feedback.
- [ ] Publish project publicly on LinkedIn/X.
- [ ] Tag Harry Chow and Solari as required by the challenge post.

### Exit Criteria

A reviewer can clone, configure, run, and understand Rehearsal with minimal setup.

---

## Future Work — Only After Submission Core Is Strong

Possible research/product extensions:

- earned autonomy based on repeated reliable workflows,
- anomaly/novelty detection,
- user-defined consequence invariants,
- human takeover and resume,
- richer provenance for evidence,
- cross-surface workflows with persistent task state,
- sampled rehearsal for mature workflows,
- organization-level policy configuration,
- causal analysis of failed rehearsals.

## What We Refuse to Do Early

To protect the core insight, do not prematurely add:

- Kubernetes,
- distributed queues,
- generic agent marketplaces,
- complex RBAC,
- arbitrary plugin systems,
- universal policy DSLs,
- multi-agent consensus,
- blockchain/audit gimmicks,
- production financial integrations.

## Submission Principle

> **Ship the moment where Rehearsal prevents one believable consequential mistake. Then make that moment undeniable.**
