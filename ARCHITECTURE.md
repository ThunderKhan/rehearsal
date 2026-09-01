# Rehearsal — Architecture

## 1. Architectural Goal

Rehearsal is not another computer-use agent. It is a safety controller that sits **above** agent execution and intervenes only when an action is likely to create consequential state.

The architecture must therefore separate:

1. **execution surfaces** — where the agent acts,
2. **semantic intent** — what the agent is trying to cause,
3. **risk evaluation** — whether the action deserves friction,
4. **evidence validation** — whether the proposed consequence is consistent with task intent and independent data,
5. **commit control** — whether the action may become real.

## 2. High-Level System

```text
                    USER / TASK
                        │
                        ▼
                 COMPUTER-USE AGENT
                        │
            reversible work proceeds
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
 Solari Browser    Solari Desktop   Solari Sandbox
    web UI            GUI apps       headless work
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                Commit Boundary
                        │
                        ▼
                 Action Manifest
                        │
                        ▼
               Rehearsal Controller
              ┌─────────┼─────────┐
              ▼         ▼         ▼
           Risk       Evidence   Rehearsal
         Scoring      Checks      Engine
              └─────────┼─────────┘
                        ▼
            DIRECT / VERIFY /
            REHEARSE / ESCALATE
                        │
                        ▼
                 Commit Controller
```

## 3. Core Components

### 3.1 Surface Adapters

Each Solari product is represented through a thin adapter.

```ts
type Surface = "browser" | "desktop" | "sandbox";
```

Responsibilities:

- start/stop the Solari resource,
- expose observable state,
- receive agent actions,
- emit candidate commit events,
- execute or withhold a commit action.

The controller must not contain Browser-specific assumptions when deciding whether an action is consequential.

### 3.2 Commit Detector

The Commit Detector decides whether the next action crosses a meaningful boundary.

Input:

```text
current state + proposed action + task context
```

Output:

```text
ordinary action
or
candidate commit boundary
```

For the MVP, detection should be explicit and deterministic around known demo actions. A future version may use semantic classification and workflow history.

Examples of candidate commits:

- `confirm_payment`
- `send_message`
- `publish`
- `delete`
- `submit`
- `revoke_access`
- `apply_changes`

### 3.3 Action Manifest

The Action Manifest is the contract between execution and safety evaluation.

Suggested schema:

```ts
export interface ActionManifest {
  id: string;
  timestamp: string;

  type: ActionType;
  surface: Surface;
  commitAction: string;

  actor: {
    agentId: string;
    taskId: string;
  };

  intent: Record<string, unknown>;
  expectedEffect: Record<string, unknown>;
  observedState: Record<string, unknown>;

  riskSignals: {
    irreversibility: number;
    blastRadius: number;
    externality: number;
    uncertainty: number;
  };

  evidenceRefs: string[];
}
```

The manifest should be serializable and preserved in the event log.

### 3.4 Risk Evaluator

Purpose: choose how much safety friction the action deserves.

MVP approach:

- normalize each signal to a small scale,
- use a transparent weighted score,
- allow hard overrides for critical rules.

Example:

```ts
score =
  irreversibility * 0.35 +
  blastRadius     * 0.25 +
  externality     * 0.20 +
  uncertainty     * 0.20;
```

Mapping:

```text
low       → DIRECT
moderate  → VERIFY
high      → REHEARSE
critical  → ESCALATE
```

Hard failures in critical invariants may escalate regardless of numeric score.

### 3.5 Evidence Engine

The Evidence Engine answers:

> Does the proposed consequence agree with independent evidence and task constraints?

The engine should prefer deterministic invariants after extraction.

Example payment invariants:

```text
manifest.amount == invoice.amount
manifest.currency == invoice.currency
manifest.vendor == invoice.vendor
manifest.invoice_id not in paidInvoices
manifest.destination_account == trustedVendorAccount
```

LLMs may assist with unstructured extraction or semantic normalization, but the final comparison should be deterministic where possible.

### 3.6 Rehearsal Engine

Supports two modes.

#### Consequence Rehearsal

For external systems that cannot be cloned.

```text
live proposed action
      ↓
semantic state transition
      ↓
independent evidence + constraints
      ↓
predicted/validated consequence
```

#### Execution Rehearsal

For controlled environments that can be cloned.

```text
current state
    ↓
snapshot / fork
    ↓
execute proposed action in branch
    ↓
inspect resulting state
```

The MVP requires consequence rehearsal. Execution rehearsal is P1.

### 3.7 Commit Controller

This component owns the final decision to execute the consequential action.

Invariant:

> No surface adapter may execute a protected commit while a Rehearsal decision is pending.

Possible decisions:

```ts
type Decision =
  | { level: "DIRECT" }
  | { level: "VERIFY" }
  | { level: "REHEARSE"; passed: true }
  | { level: "ESCALATE"; reasons: Reason[] };
```

For blocked/escalated actions, the commit action remains withheld.

### 3.8 Event Log

Every important transition should be recorded:

```text
task_started
surface_started
action_observed
commit_boundary_detected
manifest_created
risk_evaluated
invariant_checked
rehearsal_completed
commit_allowed
commit_blocked
human_escalation
```

The event log supports the dashboard and makes the demo auditable.

SQLite is sufficient for the MVP.

## 4. Solari Surface Responsibilities

### Browser

Use for:

- web navigation,
- form preparation,
- live account/page context,
- final web commit actions,
- session recording where useful.

The Browser adapter should expose the state needed to construct an Action Manifest at the boundary.

### Sandbox

Use for:

- evidence ingestion,
- file parsing,
- deterministic validation,
- isolated helper code,
- synthetic service hosting,
- future snapshot/fork experiments.

The Sandbox is the analytical laboratory, not merely a place to run the agent.

### Desktop

Use for:

- GUI workflows outside the browser,
- synthetic ERP/accounting applications,
- destructive file-management example,
- arbitrary screen-based agent operations.

## 5. Primary Demo Data Flow

```text
invoice.pdf ─────────────┐
purchase_order.json ─────┼──► Sandbox evidence normalization
vendor_history.json ─────┘             │
                                       ▼
                               Evidence Record
                                       │
                                       │
Agent ─► Desktop synthetic ERP         │
  │                                    │
  └────► Browser payment portal        │
                 │                     │
          CONFIRM PAYMENT              │
                 │                     │
                 ▼                     │
          Action Manifest ◄────────────┘
                 │
                 ▼
        deterministic invariants
                 │
                 ▼
      destination mismatch found
                 │
                 ▼
             ESCALATE
```

## 6. Speculative Preparation

P1 optimization:

Evidence work should begin before the commit boundary whenever the likely future action is known.

```text
agent timeline ─────────────────────────────►

invoice identified
      │
      └────► sandbox parses evidence
                    │
                    └────► invariants precomputed

                         agent reaches CONFIRM
                                  │
                                  └────► near-instant decision
```

This reduces user-visible friction while preserving pre-commit safety.

## 7. Suggested Repository Layout

The final layout may evolve, but the initial target is:

```text
examples/
└── rehearsal/
    ├── README.md
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── agent/
    │   ├── rehearsal/
    │   │   ├── manifest.ts
    │   │   ├── commit-detector.ts
    │   │   ├── risk.ts
    │   │   ├── evidence.ts
    │   │   ├── controller.ts
    │   │   └── decision.ts
    │   ├── surfaces/
    │   │   ├── browser.ts
    │   │   ├── sandbox.ts
    │   │   └── desktop.ts
    │   ├── demo/
    │   └── server.ts
    ├── data/
    └── tests/
```

Do not scaffold empty directories just to match this diagram. Create components when they become necessary.

## 8. Technology Choices

Preferred MVP stack:

- TypeScript
- Node.js
- Solari JavaScript SDKs
- Playwright where required by Solari Browser examples
- Zod for manifest/runtime validation
- SQLite for event history
- minimal React/Vite UI only when the core path works

Avoid distributed infrastructure. There is no MVP requirement for Redis, Kafka, Kubernetes, or multiple backend services.

## 9. Trust Boundaries

Important architectural boundaries:

1. **Agent output is untrusted input.**
2. **Action Manifest extraction must be validated.**
3. **Independent evidence should not be silently overwritten by agent state.**
4. **Critical invariants should be deterministic whenever possible.**
5. **A failed/pending Rehearsal decision must fail closed for protected commits.**
6. **No real consequential financial/legal action belongs in the demo.**

## 10. Architectural Principle

> Rehearsal reasons about state transitions, not clicks.

The browser, desktop, and sandbox are execution surfaces. The safety abstraction above them is the consequence an action creates.
