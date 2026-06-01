# Go Idiomatic Report — internal/user

> Framework: Go Idiomatic — Idiomatic Go Code Checklist v1.0
> Language: Go 1.23 · Assessed: 2026-06-01
> Sources: Effective Go (go.dev/doc/effective_go); Go Code Review Comments (go.dev/wiki/CodeReviewComments); Uber Go Style Guide (github.com/uber-go/guide)

## Global Score: 55/100 🟠 Weak

```
██████░░░░  55%
```

- ✅ Achieved: **32**
- ❌ Not achieved: **26**
- ⏳ Pending (not evaluated): **0**
- ➖ Not applicable: **13**
- 📊 Assessment coverage: **100%** (71/71 rules evaluated)

## Score by Dimension

| Dimension | Score | Bar | ✅ | ❌ | ⏳ | ➖ |
|---|---:|---|---:|---:|---:|---:|
| Formatting & Tooling | 75% | `████████░░` | 3 | 1 | 0 | 0 |
| Naming | 50% | `█████░░░░░` | 3 | 3 | 0 | 1 |
| Comments & Documentation | 33% | `███░░░░░░░` | 1 | 2 | 0 | 0 |
| Error Handling | 63% | `██████░░░░` | 5 | 3 | 0 | 0 |
| Control Flow & Readability | 75% | `████████░░` | 3 | 1 | 0 | 0 |
| Interfaces & Types | 50% | `█████░░░░░` | 3 | 3 | 0 | 1 |
| Concurrency | 100% | `██████████` | 2 | 0 | 0 | 4 |
| Structs & Initialization | 50% | `█████░░░░░` | 2 | 2 | 0 | 2 |
| Packages & Globals | 80% | `████████░░` | 4 | 1 | 0 | 0 |
| Data, Slices & Stdlib | 100% | `██████████` | 2 | 0 | 0 | 4 |
| Testing | 50% | `█████░░░░░` | 1 | 1 | 0 | 1 |
| Non-Idiomatic Patterns (Java/C#-isms) | 25% | `███░░░░░░░` | 3 | 9 | 0 | 0 |

## Rules Not Achieved

### Formatting & Tooling

- ❌ **FMT-04** — Identifiers use MixedCaps/mixedCaps, never ALL_CAPS or snake_case.  `[auto: revive]`  
  ↳ _Constants written as MAX_RETRIES, DEFAULT_TIMEOUT_
### Naming

- ❌ **NAM-01** — Initialisms keep consistent case (URL, ID, HTTP — not Url, Id, Http).  `[auto: staticcheck]`  
  ↳ _Fields named Id and HttpClient instead of ID and HTTPClient_
- ❌ **NAM-03** — Method receivers use a 1–2 letter abbreviation, consistent across the type (not 'self'/'this'/'me').  `[auto: revive]`  
  ↳ _Receiver named 'this' (this *UserService)_
- ❌ **NAM-05** — Getters omit the 'Get' prefix (owner.Owner(), not owner.GetOwner()).  `[manual review]`  
  ↳ _GetName(), GetEmail() getters instead of Name()/Email() or exported fields_
### Comments & Documentation

- ❌ **CMT-01** — Every exported name has a doc comment beginning with the name and ending with a period.  `[auto: revive]`  
  ↳ _Exported UserService and methods have no doc comments_
- ❌ **CMT-02** — Each package has a package comment adjacent to the package clause (no blank line).  `[auto: staticcheck]`  
  ↳ _No package comment_
### Error Handling

- ❌ **ERR-02** — Normal failure paths return errors rather than calling panic.  `[manual review]`  
  ↳ _panic(err) used for validation failures instead of returning error_
- ❌ **ERR-03** — Error strings are lowercase and not ended with punctuation.  `[auto: staticcheck]`  
  ↳ _Error strings Capitalized and end with '.'_
- ❌ **ERR-04** — Wrapped errors use fmt.Errorf with %w; comparisons use errors.Is/errors.As (not ==/type-switch on strings).  `[auto: errorlint]`  
  ↳ _Errors compared with == on .Error() strings; no %w wrapping_
### Control Flow & Readability

- ❌ **CTL-01** — No 'else' after an if-branch that already returns/continues/breaks.  `[auto: revive]`  
  ↳ _else branches after returning ifs throughout_
### Interfaces & Types

- ❌ **IFC-01** — Functions accept interfaces and return concrete types; they don't return interfaces by default.  `[auto: ireturn]`  
  ↳ _NewUserService returns IUserService interface instead of *UserService_
- ❌ **IFC-02** — Interfaces are declared in the consumer package that uses them, not the producer.  `[manual review]`  
  ↳ _Interfaces defined in the producer package alongside their only implementation_
- ❌ **IFC-03** — Interfaces are small (often one method); no broad 'everything' interfaces.  `[manual review]`  
  ↳ _IUserService has 11 methods — one giant interface_
### Structs & Initialization

- ❌ **STR-01** — Struct literals use field names; positional (unkeyed) literals are avoided.  `[auto: govet]`  
  ↳ _User{1, "bob", true} positional struct literals_
- ❌ **STR-04** — Flexible constructors use functional options rather than many optional parameters or telescoping constructors.  `[manual review]`  
  ↳ _UserServiceBuilder with .SetX().Build() instead of New + options_
### Packages & Globals

- ❌ **PKG-01** — No mutable package-level globals; shared state is passed via dependency injection.  `[auto: gochecknoglobals]`  
  ↳ _package-level var DefaultUserService mutated at runtime_
### Testing

- ❌ **TST-01** — Parametric tests use the table-driven pattern with named subtests (t.Run).  `[manual review]`  
  ↳ _Separate TestX functions per case instead of a table_
### Non-Idiomatic Patterns (Java/C#-isms)

- ❌ **JCS-01** — Interfaces are NOT prefixed with 'I' (Store, not IStore).  `[manual review]`  
  ↳ _IUserService, IUserRepository — 'I' prefix on interfaces_
- ❌ **JCS-02** — No Abstract*/Base*/*Impl types emulating class inheritance; behavior is composed.  `[manual review]`  
  ↳ _AbstractEntity base type + UserServiceImpl naming_
- ❌ **JCS-03** — No exception-style control flow: panic/recover is not used in place of returning errors.  `[manual review]`  
  ↳ _panic/recover used as a try/catch around request handling_
- ❌ **JCS-04** — No getter/setter pairs over plain data — export the field instead.  `[manual review]`  
  ↳ _GetName/SetName, GetEmail/SetEmail over plain fields_
- ❌ **JCS-05** — Construction uses NewX functions (and functional options); no Factory/Builder 'classes' where those suffice.  `[manual review]`  
  ↳ _UserFactory + UserServiceBuilder where NewUser/New + options fit_
- ❌ **JCS-06** — Constants use MixedCaps (MaxRetries), not Java/C# ALL_CAPS (MAX_RETRIES).  `[auto: staticcheck]`  
  ↳ _ALL_CAPS constants (MAX_RETRIES)_
- ❌ **JCS-07** — Packages aren't catch-all 'manager/service/util/helpers/common/base' dumping grounds named after layers.  `[manual review]`  
  ↳ _internal/managers, internal/util grab-bag packages_
- ❌ **JCS-08** — Optional/absent values use zero values, (T, ok), or (T, error) — not pointers-to-everything to mimic nullable types.  `[manual review]`  
  ↳ _*string / *bool everywhere to emulate nullable types_
- ❌ **JCS-10** — Functions don't return interfaces 'for flexibility'; they return concrete types (accept interfaces, return structs).  `[auto: ireturn]`  
  ↳ _Most constructors return interfaces_

## Next Steps

1. **Non-Idiomatic Patterns (Java/C#-isms)** (25%) — resolve 9 rule(s) to raise this dimension's score.
2. **Comments & Documentation** (33%) — resolve 2 rule(s) to raise this dimension's score.
3. **Naming** (50%) — resolve 3 rule(s) to raise this dimension's score.
4. **Interfaces & Types** (50%) — resolve 3 rule(s) to raise this dimension's score.
5. **Structs & Initialization** (50%) — resolve 2 rule(s) to raise this dimension's score.
6. **Testing** (50%) — resolve 1 rule(s) to raise this dimension's score.
7. **Error Handling** (63%) — resolve 3 rule(s) to raise this dimension's score.
8. **Formatting & Tooling** (75%) — resolve 1 rule(s) to raise this dimension's score.
9. **Control Flow & Readability** (75%) — resolve 1 rule(s) to raise this dimension's score.
10. **Packages & Globals** (80%) — resolve 1 rule(s) to raise this dimension's score.

## Automate These (linter cross-reference)

13 of 26 failed rules can be caught automatically. Wire these into golangci-lint / CI:

| Linter | What it catches | Failed rules |
|---|---|---|
| `errorlint` | error wrapping & comparison | ERR-04 |
| `gochecknoglobals` | mutable package globals | PKG-01 |
| `govet` | suspicious constructs (copylocks, printf, composites, lostcancel) | STR-01 |
| `ireturn` | flags returning interfaces | IFC-01, JCS-10 |
| `revive` | style/lint (successor to golint) | FMT-04, NAM-03, CMT-01, CTL-01 |
| `staticcheck` | correctness & simplification (SA/S/ST checks) | NAM-01, CMT-02, ERR-03, JCS-06 |

The remaining **13** failure(s) need human/Claude judgment (design-level, not lint-detectable).

---
_To track progress, re-run the assessment after fixes and compare the Global Score (55/100)._
