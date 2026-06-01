---
name: go-idiomatic
description: "Use when auditing whether Go code is written the idiomatic Go way — and flagging Java/C#-isms that don't belong. Checks a package or file against 12 dimensions (~60 rules): formatting & tooling, naming, comments, error handling, control flow, interfaces & types, concurrency, structs & initialization, packages & globals, data/slices/stdlib, testing, and a flagship Non-Idiomatic Patterns dimension (IFoo interfaces, getters/setters, panic-as-exceptions, Abstract/Base/Impl, factory/builder classes, manager/util packages, ALL_CAPS constants, returning interfaces). Exports a markdown report with unmet rules, a prioritized next-steps list, a 0-100 score, and a linter cross-reference (which findings golangci-lint can auto-catch). Triggers: 'is this idiomatic Go', 'go code review', 'check my Go package', 'does this look like Java', 'go best practices audit'."
user-invocable: true
argument-hint: "[Go package path or file]"
allowed-tools:
  - Bash(node *)
  - Bash(go *)
  - Bash(golangci-lint *)
  - Read
  - Glob
  - Grep
---

# Go Idiomatic — Idiomatic Go Auditor

Audits Go code against **12 dimensions** (~60 rules) drawn from **Effective Go**, the **Go Code
Review Comments**, and the **Uber Go Style Guide**. It outputs a markdown report listing every rule
**not achieved**, a prioritized **next-steps** list, a **0–100 score**, and a **linter
cross-reference** showing which failures a tool can auto-catch vs. which need human judgment.

Its flagship dimension, **Non-Idiomatic Patterns (Java/C#-isms)**, targets exactly the habits that
leak in from other OOP languages: `IFoo` interfaces, getter/setter pairs, `panic` as exceptions,
`Abstract*/Base*/*Impl` types, factory/builder "classes", `manager`/`util` packages, `ALL_CAPS`
constants, and returning interfaces "for flexibility".

## The dimensions

All rules live in `reference/rules.json` — the single source of truth. 12 dimensions, ~60 rules:

| # | Dimension | # | Dimension |
|---|---|---|---|
| FMT | Formatting & Tooling | IFC | Interfaces & Types |
| NAM | Naming | CON | Concurrency |
| CMT | Comments & Documentation | STR | Structs & Initialization |
| ERR | Error Handling | PKG | Packages & Globals |
| CTL | Control Flow & Readability | DAT | Data, Slices & Stdlib |
| TST | Testing | **JCS** | **Non-Idiomatic Patterns (Java/C#-isms)** |

## Workflow

1. **Identify the target.** Take the package path or file(s) from the argument. Read the `.go`
   files — types, methods, interfaces, error handling, concurrency, package layout, and tests.

2. **(Recommended) Run the linters first.** If the toolchain is available, run them so machine-
   detectable issues are grounded in real output before you judge the design-level rules:
   ```bash
   gofmt -l .            # files needing formatting
   go vet ./...          # suspicious constructs
   golangci-lint run     # if configured — covers most of the [auto:] rules
   ```
   Feed what they report into the matching rules; spend your own judgment on the `[manual review]`
   rules (interfaces, panic-as-exceptions, getters, package design — the things a linter can't see).

3. **Load the rules.** Read `reference/rules.json`. For each rule, judge the target as:
   - `pass` — the code follows the idiom.
   - `fail` — the idiom is violated (e.g. an `IStore` interface, a `GetName()` getter).
   - `na` — the rule doesn't apply (e.g. no concurrency in this package → `CON` rules are `na`).
   Be conservative: if you can't confirm a rule is met, mark `fail`, not `pass`.

4. **Write the assessment JSON.** Save to `assessments/<target>.json`:
   ```json
   {
     "target": "internal/user",
     "language": "Go 1.23",
     "assessedAt": "2026-06-01",
     "results": {
       "ERR-01": { "status": "pass" },
       "JCS-01": { "status": "fail", "note": "IUserRepository should be UserRepository" },
       "CON-04": { "status": "na" }
     }
   }
   ```
   Tip: `node scripts/score.mjs --template internal/user > assessments/user.json` emits a blank
   skeleton with every rule pre-listed. A rule omitted from `results` counts as **pending**.

5. **Score & generate the report.**
   ```bash
   node scripts/score.mjs assessments/user.json --out assessments/user.report.md
   ```

6. **Report back** the Global Score, the worst dimensions, the top Java/C#-isms found, and which
   failures are auto-catchable. Point the user to the generated `.report.md`.

## Scoring

- **Per dimension:** `score = pass / (total − na) × 100`.
- **Global:** `pass / (total applicable rules) × 100`, rounded to 0–100.
- **Coverage:** % of rules explicitly evaluated (pending rules count against you).
- **Levels:** 🟢 90+ Excellent · 🟢 75+ Good · 🟡 60+ Acceptable · 🟠 40+ Weak · 🔴 <40 Critical.

Re-run after fixes and compare the Global Score to track progress. Keep each target's
`assessments/<target>.json` as the running record.

## Linter cross-reference

Each rule carries an optional `lint` field (e.g. `errcheck`, `ireturn`, `staticcheck`). The report's
**Automate These** section groups failed rules by linter so you know what to wire into
`golangci-lint`/CI, and what is left to human/Claude design review. Rules with no linter are tagged
`[manual review]`.

## Notes

- This skill checks and scores Go; it does not rewrite it. Use it to baseline a package, gate a PR,
  or settle "is this idiomatic?" debates with a concrete number.
- The rules are fully editable in `reference/rules.json` — add house rules, drop ones you disagree
  with, keep the `id`s stable so historical reports stay comparable.
