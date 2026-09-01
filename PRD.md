# Rehearsal — Product Requirements Document

> **Tagline:** Let AI act freely — until the action becomes real.

## 1. Product Summary

Rehearsal is a speculative safety layer for autonomous computer-use agents.

Agents are allowed to perform reversible work normally across browsers, desktops, and sandboxes. When an agent approaches a consequential boundary — such as **Send**, **Pay**, **Delete**, **Submit**, **Publish**, **Revoke**, or **Confirm** — Rehearsal intercepts the proposed state transition, evaluates its likely consequence, and chooses the cheapest safe response: execute directly, verify, rehearse, or escalate to a human.

The product is built around Solari's three execution surfaces behind one API key:

- **Cloud Browser** for real web workflows.
- **Sandbox** for isolated computation, evidence processing, simulation, and controlled execution.
- **Desktop** for arbitrary GUI and legacy-software workflows.

The core insight is not to sandbox every task. Safety is applied **only where the action becomes difficult to undo, externally visible, high-impact, or unusually uncertain**.

## 2. Problem

Computer-use agents can increasingly operate real software, but reliability changes meaning when actions create real-world state.

An agent can correctly understand a task yet still produce the wrong consequence because it:

- selected the wrong entity,
- entered the wrong amount,
- misread a changed interface,
- acted on stale information,
- misunderstood a confirmation screen,
- duplicated an action,
- or made a semantically incorrect external commitment.

Two common safety models are inadequate:

1. **Unrestricted autonomy** — fast, but dangerous for consequential actions.
2. **Human approval for everything** — safe, but destroys the benefit of autonomy.

Rehearsal introduces a third model: **continuous autonomy during reversible work, selective verification at commit boundaries**.

## 3. Product Thesis

A computer-use agent should not ask permission for every click. It should also not discover mistakes after clicking **Send**, **Pay**, or **Delete**.

Rehearsal treats consequential actions as state transitions that can be inspected before commit.

```text
reversible work
      ↓
agent approaches commit boundary
      ↓
Action Manifest
      ↓
risk + evidence + consequence analysis
      ↓
DIRECT | VERIFY | REHEARSE | ESCALATE
```

## 4. Core Concepts

### 4.1 Commit Boundary

A commit boundary is the point where an action changes meaningful external state or becomes costly to reverse.

Examples:

- draft email → **Send**
- fill checkout → **Place order**
- select files → **Delete**
- edit permissions → **Apply changes**
- fill official form → **Submit**
- prepare payment → **Confirm transfer**

Rehearsal protects the boundary, not the entire workflow.

### 4.2 Action Manifest

Before a consequential action is committed, Rehearsal converts UI intent into a structured semantic representation.

Example:

```json
{
  "type": "payment",
  "surface": "browser",
  "recipient": "Acme Logistics",
  "amount": 28400,
  "currency": "USD",
  "invoice_id": "8291",
  "destination_account": "8831",
  "commit_action": "confirm_payment"
}
```

This allows Rehearsal to reason about **"send $28,400 to Acme"**, rather than **"click at x=721, y=420"**.

### 4.3 Risk Signals

For the MVP, Rehearsal evaluates four signals:

- **Irreversibility** — how difficult is the action to undo?
- **Blast radius** — how many people/resources can it affect?
- **Externality** — does it leave the agent's private workspace?
- **Uncertainty / novelty** — how unfamiliar or ambiguous is the current state?

Conceptually:

```text
RehearsalNeed = f(irreversibility, blastRadius, externality, uncertainty)
```

The initial implementation should use a transparent rule/weighted model, not pretend to have a scientifically optimal risk formula.

### 4.4 Safety Levels

Rehearsal chooses among four responses:

| Level | Meaning |
| --- | --- |
| `DIRECT` | Execute normally. |
| `VERIFY` | Execute, then verify resulting state. |
| `REHEARSE` | Evaluate or simulate the consequence before commit. |
| `ESCALATE` | Do not execute; require human decision. |

The design goal is to use the **lowest-friction level that provides enough confidence**.

## 5. Rehearsal Modes

### 5.1 Consequence Rehearsal

Used when the external system cannot be cloned, such as a public SaaS, bank, email provider, or commerce site.

```text
live state
   ↓
extract proposed transition
   ↓
validate against intent + evidence + constraints
   ↓
allow / block / escalate
```

Rehearsal does **not** pretend it can clone a third-party backend.

### 5.2 Execution Rehearsal

Used when the environment is under our control and can be copied or forked.

```text
safe state
   ↓
snapshot / fork
   ↓
perform proposed action in isolated branch
   ↓
inspect resulting state
   ↓
commit or reject
```

This is literal rehearsal.

## 6. Solari Integration

Rehearsal treats Solari as one execution substrate with three surfaces.

### Cloud Browser

Used for web-based agent work and commit boundaries such as:

- sending messages,
- confirming purchases,
- submitting forms,
- publishing content,
- payment confirmation.

Provides live page state, DOM/visual context, session state, and recordings.

### Sandbox

Used as the evidence and experimentation layer:

- parse and normalize documents,
- run deterministic invariant checks,
- compare proposed actions against historical/reference data,
- execute controlled code,
- host cloneable test applications,
- snapshot/fork controlled environments.

### Desktop

Used for arbitrary GUI and legacy software where browser automation is insufficient:

- ERP clients,
- office applications,
- accounting software,
- internal desktop tools,
- arbitrary Linux GUI workflows.

The same Rehearsal controller should apply regardless of which surface the agent is using.

## 7. Primary MVP Scenario

### Accounts-Payable Worker

An autonomous worker receives a synthetic invoice and is asked to process it.

1. **Sandbox** parses invoice and reference data.
2. **Desktop** is used to update a synthetic internal accounting application.
3. **Browser** is used to prepare a synthetic payment.
4. The agent reaches **Confirm Payment**.
5. Rehearsal creates an Action Manifest.
6. Independent evidence reveals that the destination bank account differs from historical vendor data.
7. Rehearsal blocks the commit and explains why.

Example result:

```text
REHEARSAL RESULT

Action: Pay Acme Logistics $28,400
Risk: HIGH

✓ invoice amount matches
✓ purchase order matches
✓ invoice is unpaid
✗ destination account changed

Decision: BLOCK / ESCALATE
```

Nothing is actually transferred in the MVP. All demonstrations must use synthetic/local systems or non-consequential test environments.

## 8. Secondary Scenarios

Only implement after the primary scenario works end-to-end.

### External Communication

Agent prepares a customer message claiming a refund has been approved, while system evidence says the refund is still pending. Rehearsal blocks **Send**.

### Destructive Desktop Action

Agent is asked to clean obsolete files and includes a directory referenced by a restore policy. Rehearsal blocks **Delete**.

These show financial, social, and data consequences without turning Rehearsal into a domain-specific checker.

## 9. Functional Requirements

### P0 — Required

- Launch and control at least one Solari Browser workflow.
- Launch and control at least one Solari Sandbox workflow.
- Launch and control at least one Solari Desktop workflow.
- Represent consequential actions as Action Manifests.
- Detect known commit boundaries in the demo workflows.
- Compute an explainable risk classification.
- Run deterministic evidence/invariant checks.
- Return `DIRECT`, `VERIFY`, `REHEARSE`, or `ESCALATE`.
- Prevent a blocked action from being committed.
- Produce a human-readable explanation with supporting evidence.
- Record enough event history to reconstruct why a decision was made.

### P1 — Strong follow-up

- Begin evidence preparation before the agent reaches the commit boundary.
- Demonstrate execution rehearsal using a forkable controlled environment.
- Add a second consequence class.
- Add a minimal event timeline/dashboard.

### P2 — Future

- Learn workflow familiarity and reduce rehearsal frequency over time.
- Detect novel UI/workflow states.
- Support user-defined invariants/policies.
- Human takeover and resume.
- Multi-step causal consequence analysis.

## 10. Non-Goals

The MVP is **not**:

- a universal AI safety system,
- a fraud-detection product,
- a generic approval workflow,
- an autonomous payment product,
- a browser extension,
- a policy-language platform,
- a replacement for access controls,
- a guarantee that an action is safe,
- a system for executing real financial/legal/destructive actions during the demo.

## 11. Success Criteria

The MVP succeeds when a reviewer can watch a single end-to-end run and understand, without a long explanation, that:

1. the agent performs reversible work without interruption,
2. a consequential boundary is detected,
3. the proposed consequence is represented semantically,
4. independent evidence is checked,
5. an unsafe action is prevented before commitment,
6. the same model can apply across browser, sandbox, and desktop surfaces.

### Demo success target

A viewer should understand the core idea within **30 seconds** and see a complete proof within **2–3 minutes**.

## 12. Product Principle

> **Autonomy should be continuous while work is reversible, and conditional only when consequences become real.**
