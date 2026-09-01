# Rehearsal — Minimum Viable Product

## Goal

Prove one thing convincingly:

> An autonomous computer-use agent can operate normally until it reaches a consequential commit boundary, at which point Rehearsal can inspect the proposed consequence and prevent an unsafe commit before reality changes.

The MVP should be **small, end-to-end, visually obvious, and real on Solari**.

## MVP Scenario

### Synthetic Accounts-Payable Worker

The agent receives an invoice for **Acme Logistics** and is asked to process it.

Synthetic evidence:

- Invoice #8291
- Amount: $28,400
- Currency: USD
- Destination bank account ending: `8831`
- Historical trusted vendor account ending: `1429`

The discrepancy is intentionally subtle enough that the agent can proceed through the workflow before Rehearsal catches it at the final commit boundary.

## Required Flow

```text
invoice + reference evidence
          ↓
     Solari Sandbox
          ↓
 structured business data
          ↓
      agent workflow
     ↙            ↘
Desktop          Browser
internal record  payment preparation
     \            /
      commit boundary
      CONFIRM PAYMENT
            ↓
      Action Manifest
            ↓
   Rehearsal evaluation
            ↓
 account mismatch found
            ↓
        BLOCKED
```

## What Must Be Real

The following should use real Solari services, not mocked SDK calls:

- create and use a Solari Sandbox,
- create and use a Solari Browser,
- create and use a Solari Desktop,
- demonstrate actual control of each surface,
- run the Rehearsal decision path around a live demo workflow.

The business systems themselves may be synthetic/local because the demo must not perform real consequential financial or destructive actions.

## P0 Deliverables

### 1. Solari Surface Smoke Tests

Create minimal proof scripts for each surface:

- Browser: launch, navigate, read state, close.
- Sandbox: launch, write/read a file, run a command, kill.
- Desktop: launch, take screenshot, click/type, kill.

**Done when:** all three run successfully using the same Solari API key.

### 2. Action Manifest

Define a typed representation for a proposed consequential action.

Minimum fields:

```ts
interface ActionManifest {
  id: string;
  type: string;
  surface: "browser" | "desktop" | "sandbox";
  intent: Record<string, unknown>;
  expectedEffect: Record<string, unknown>;
  commitAction: string;
  riskSignals: {
    irreversibility: number;
    blastRadius: number;
    externality: number;
    uncertainty: number;
  };
}
```

**Done when:** the payment workflow emits a manifest before the final commit.

### 3. Commit Detector

For the MVP, commit detection may be deterministic and scenario-aware.

Recognized consequential verbs/actions:

- confirm payment,
- send,
- publish,
- delete,
- submit,
- revoke,
- apply irreversible changes.

**Done when:** reversible actions pass through and the final payment confirmation triggers Rehearsal.

### 4. Risk Controller

Implement four decisions:

```text
DIRECT
VERIFY
REHEARSE
ESCALATE
```

The initial decision model should be explicit and inspectable.

Example weighted score:

```text
risk =
  irreversibility * 0.35 +
  blastRadius     * 0.25 +
  externality     * 0.20 +
  uncertainty     * 0.20
```

The score is a product heuristic, not a claim of scientific optimality.

**Done when:** low-risk demo actions remain uninterrupted and payment confirmation is classified as requiring rehearsal.

### 5. Evidence Engine

The Sandbox should independently evaluate the Action Manifest against structured evidence.

Required invariants for the payment demo:

- invoice amount equals proposed payment amount,
- currency matches,
- invoice is not already paid,
- vendor identity matches,
- destination account matches trusted/reference account.

**Done when:** the destination mismatch is detected without relying on a single free-form LLM judgment.

### 6. Commit Blocking

The irreversible action must not execute when Rehearsal fails.

**Done when:** the browser visibly reaches the final confirmation state but the confirm action is withheld and a clear block reason is emitted.

### 7. Decision Explanation

Produce a concise result:

```text
Action: Pay Acme Logistics $28,400
Decision: ESCALATE
Risk: HIGH

Passed:
✓ amount matches invoice
✓ purchase order matches
✓ invoice is unpaid

Failed:
✗ destination account expected ****1429, proposed ****8831
```

**Done when:** a human can tell exactly why the action was stopped.

## P1 — If P0 Is Solid

### Speculative Preparation

Begin parsing and validating evidence while the agent is still progressing through reversible steps.

Goal: by the time the commit boundary appears, most validation is already complete.

### Execution Rehearsal

Add one controlled/forkable scenario where a Solari environment can genuinely be snapshotted/forked and the proposed action executed in the fork before production commit.

### Second Consequence Class

Preferred: external communication.

Example: an agent is about to send a message claiming a refund was approved while system state says it is still pending.

### Minimal Timeline UI

Show events such as:

```text
13:04:02  invoice parsed
13:04:08  desktop record created
13:04:14  payment prepared
13:04:15  commit boundary detected
13:04:15  rehearsal started
13:04:16  account invariant failed
13:04:16  action blocked
```

## Explicitly Out of Scope

Do not add these before the core demo is excellent:

- production payments,
- arbitrary enterprise integrations,
- real banking credentials,
- universal policy DSL,
- multi-agent voting,
- generalized RPA,
- full enterprise auth/RBAC,
- complex observability stack,
- autonomous remediation,
- broad machine-learning risk models.

## MVP Acceptance Test

The project is MVP-complete when this exact sequence works:

1. User starts the AP task.
2. Agent performs reversible work without permission prompts.
3. Agent reaches **Confirm Payment**.
4. Rehearsal intercepts before click/commit.
5. An Action Manifest is created.
6. Sandbox evidence checks execute.
7. Bank destination mismatch is found.
8. Rehearsal blocks or escalates.
9. No payment is committed.
10. Reviewer sees the evidence and understands why.

## Demo Standard

The demo should make the idea obvious before explaining the architecture.

**Target:**

- first 15 seconds: autonomous work feels normal,
- next 5 seconds: Rehearsal activates only at the consequential boundary,
- next 10 seconds: evidence catches the unsafe consequence,
- remaining time: show how Browser + Sandbox + Desktop form one Solari-native safety layer.

## MVP Principle

> One beautiful blocked mistake is more convincing than ten half-built safety features.
