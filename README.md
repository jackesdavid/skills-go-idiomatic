<div align="center">

# 🐹 go-idiomatic

### A Claude Code skill that audits Go code for idiomatic style — and catches the Java/C#-isms hiding in it.

[![Skill](https://img.shields.io/badge/Claude%20Code-Skill-7c3aed)](https://docs.claude.com/en/docs/claude-code)
[![Rules](https://img.shields.io/badge/rules-71-00ADD8)](reference/rules.json)
[![Dimensions](https://img.shields.io/badge/dimensions-12-16a34a)](#-the-12-dimensions)
[![Sources](https://img.shields.io/badge/sources-Effective%20Go%20%C2%B7%20CRC%20%C2%B7%20Uber-555)](#-where-the-rules-come-from)
[![License](https://img.shields.io/badge/license-MIT-black)](LICENSE)

_Point it at a Go package. Get back every non-idiomatic pattern, a prioritized to-do list, a 0–100 score, and which findings a linter can auto-catch._

</div>

---

## ✨ What it does

`go-idiomatic` reviews a Go package or file against **12 dimensions** (71 concrete rules) and exports
a clean markdown report:

- ✅ **Pass / ❌ Fail / ➖ N-A** for every rule, with your notes
- 📊 a **0–100 global score** plus a per-dimension breakdown
- 📋 a **prioritized next-steps list** (worst dimensions first)
- 🔧 a **linter cross-reference** — which failures `golangci-lint` can auto-catch vs. which need human judgment
- 🚩 a **flagship "Java/C#-isms" dimension** for the OOP habits that leak in from other languages

Re-run it after each cleanup and the **score is your progress bar**.

### 🚩 The headline feature: catching non-idiomatic patterns

The **Non-Idiomatic Patterns (Java/C#-isms)** dimension flags the things a formatter never will:

| Java/C#-ism | Idiomatic Go |
|---|---|
| `IUserService` interface | `UserService` (no `I` prefix) |
| `AbstractEntity`, `UserServiceImpl` | composition, no `Abstract`/`Base`/`Impl` |
| `panic`/`recover` as try/catch | return `error` values |
| `GetName()` / `SetName()` | exported field, or `Name()` |
| `UserFactory`, `UserServiceBuilder` | `NewUser(...)` + functional options |
| `MAX_RETRIES` | `MaxRetries` (MixedCaps) |
| `internal/util`, `internal/managers` | packages named for what they provide |
| `*string` everywhere for "nullable" | zero values, `(T, ok)`, `(T, error)` |
| returning interfaces "for flexibility" | accept interfaces, **return structs** |

---

## 🚀 Quick start

**1. Install** — drop the skill into your Claude Code skills folder:

```bash
# global (available in every project)
git clone git@github.com:jackesdavid/skills-go-idiomatic.git ~/.claude/skills/go-idiomatic

# …or per-project
git clone git@github.com:jackesdavid/skills-go-idiomatic.git .claude/skills/go-idiomatic
```

**2. Audit** — just ask Claude Code:

> _"Is this idiomatic Go? Audit `internal/user`."_

Claude runs `gofmt`/`go vet`/`golangci-lint` (if present), reads the package, judges all 71 rules,
scores it, and hands you the report.

**3. Score manually** (optional) — the engine is a dependency-free Node script:

```bash
# generate a blank assessment skeleton for a package
node scripts/score.mjs --template internal/user > assessments/user.json

# …fill in pass / fail / na for each rule, then score it
node scripts/score.mjs assessments/user.json --out assessments/user.report.md
```

---

## 📊 Example report

A real run against a deliberately Java-ish package — full output in [`examples/`](examples/).

> # Go Idiomatic Report — internal/user
>
> ## Global Score: 55/100 🟠 Weak
>
> ```
> ██████░░░░  55%
> ```
>
> - ✅ Achieved: **32** ❌ Not achieved: **26** ➖ N-A: **13** · 📊 Coverage: **100%**

**Score by dimension** (excerpt):

| Dimension | Score | Bar | ✅ | ❌ | ➖ |
|---|---:|---|---:|---:|---:|
| Error Handling | 63% | `██████░░░░` | 5 | 3 | 0 |
| Interfaces & Types | 50% | `█████░░░░░` | 3 | 3 | 1 |
| Comments & Documentation | 33% | `███░░░░░░░` | 1 | 2 | 0 |
| **Non-Idiomatic (Java/C#-isms)** | **25%** | `███░░░░░░░` | 3 | 9 | 0 |

**Rules not achieved** (excerpt) — each tagged auto vs. manual:

```
### Non-Idiomatic Patterns (Java/C#-isms)
- ❌ JCS-01 — Interfaces are NOT prefixed with 'I' (Store, not IStore).   [manual review]
  ↳ IUserService, IUserRepository — 'I' prefix on interfaces
- ❌ JCS-03 — panic/recover is not used in place of returning errors.     [manual review]
  ↳ panic/recover used as a try/catch around request handling
- ❌ JCS-10 — Functions return concrete types, not interfaces.            [auto: ireturn]
  ↳ Most constructors return interfaces
```

**Automate these** — failures grouped by the linter that catches them:

| Linter | Failed rules |
|---|---|
| `revive` | FMT-04, NAM-03, CMT-01, CTL-01 |
| `staticcheck` | NAM-01, CMT-02, ERR-03, JCS-06 |
| `ireturn` | IFC-01, JCS-10 |
| `errorlint` · `govet` · `gochecknoglobals` | ERR-04 · STR-01 · PKG-01 |

> _13 of 26 failures are auto-catchable; the other 13 are design-level and need human/Claude review._

👉 Full report: [`examples/user-service.report.md`](examples/user-service.report.md)

---

## 🧮 How scoring works

| Metric | Formula |
|---|---|
| **Per dimension** | `pass / (total − na) × 100` |
| **Global score** | `pass / (all applicable rules) × 100`, rounded 0–100 |
| **Coverage** | `% of rules explicitly evaluated` (pending rules count against you) |

`na` rules are excluded from the denominator, so a package without concurrency isn't punished for
the `CON` rules — **as long as you mark them honestly**.

**Maturity levels:** 🟢 90+ Excellent · 🟢 75+ Good · 🟡 60+ Acceptable · 🟠 40+ Weak · 🔴 &lt;40 Critical

---

## 🔧 Linter cross-reference

Each rule carries an optional `lint` field. The report's **Automate These** section groups failed
rules by tool — `gofmt`, `go vet`, `staticcheck`, `revive`, `errcheck`, `errorlint`, `ireturn`,
`gochecknoglobals`, and more — so you can wire the mechanical checks into `golangci-lint`/CI and
spend human attention on the design-level rules (`[manual review]`) a linter can't see.

---

## 🗂 The 12 dimensions

| | | | |
|---|---|---|---|
| **Formatting & Tooling** | **Naming** | **Comments & Documentation** | **Error Handling** |
| **Control Flow & Readability** | **Interfaces & Types** | **Concurrency** | **Structs & Initialization** |
| **Packages & Globals** | **Data, Slices & Stdlib** | **Testing** | 🚩 **Non-Idiomatic Patterns** |

Every rule lives in a single file: [`reference/rules.json`](reference/rules.json).

---

## 📚 Where the rules come from

Grounded in the three most authoritative Go style references:

- [**Effective Go**](https://go.dev/doc/effective_go) — the foundational idioms
- [**Go Code Review Comments**](https://go.dev/wiki/CodeReviewComments) — the canonical reviewer checklist
- [**Uber Go Style Guide**](https://github.com/uber-go/guide/blob/master/style.md) — practical Do/Don't with examples

---

## 🛠 Make it yours

Everything is one plain JSON file ([`reference/rules.json`](reference/rules.json)), so:

- ✏️ **Edit** any rule to match your team's conventions
- ➕ **Add** house rules (your own anti-patterns, package-layout rules, etc.)
- ➖ **Remove** rules you disagree with
- 🔧 Set a rule's `lint` field to map it to the linter that auto-catches it
- 🆔 Keep the `id`s stable so historical reports stay comparable

The scorer reads whatever is in `rules.json` — no code changes needed to reshape the checklist.

---

## 📁 Repo layout

```
go-idiomatic/
├── SKILL.md              # the Claude Code skill definition + workflow
├── reference/rules.json  # 12 dimensions & 71 rules (edit me!)
├── scripts/score.mjs     # zero-dependency scorer + report generator
└── examples/             # a sample Go audit + report
```

---

## 📜 License

MIT — free to use, change, and share.

<div align="center">

Made for Gophers who want their code to read like Go, not like Java in disguise. ⭐ it if it helped!

</div>
