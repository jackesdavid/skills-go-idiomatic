# 🐹 go-idiomatic — a Claude Code skill for idiomatic Go audits

## 🇬🇧 English

Hey! I built a **Claude Code skill** called **`go-idiomatic`** and wanted to share it.

**What it does:** point it at a Go package or file and it audits the code against **12 dimensions**
(71 concrete rules) — formatting, naming, comments, error handling, control flow, interfaces,
concurrency, structs, packages/globals, slices/stdlib, testing, and a flagship **"Java/C#-isms"**
dimension. Then it exports:

- ✅ a **markdown report** with every rule the code passes / fails / that doesn't apply
- 📋 a **prioritized list of next steps** (worst dimensions first)
- 📊 a **0–100 score** so you can re-run it after cleanups and watch your code get more idiomatic
- 🔧 a **linter cross-reference** — which failures `golangci-lint` can auto-catch vs. which need human review

The headline feature is catching the **OOP habits that leak in from other languages**: `IUserService`
interfaces, `GetName()`/`SetName()` getters, `panic`/`recover` used as try/catch, `Abstract*`/`*Impl`
types, `Factory`/`Builder` classes, `MAX_RETRIES` ALL_CAPS constants, `util`/`manager` grab-bag
packages, and returning interfaces "for flexibility". The things a formatter never tells you about.

It's just a folder you drop into `~/.claude/skills/` and it works in any project. Rules live in one
`rules.json`, scoring is a tiny Node script, report is plain markdown.

**Where the rules come from:** they're grounded in the three most authoritative Go references —
**Effective Go** (go.dev/doc/effective_go), the official **Go Code Review Comments**
(go.dev/wiki/CodeReviewComments), and the **Uber Go Style Guide** (github.com/uber-go/guide). Solid
baseline — but not sacred. It's all one JSON file, so **change, add, remove, or edit any rule** to
match your team's conventions. Make it yours.

Want it? It's free — copy the `go-idiomatic` folder into `~/.claude/skills/` and ask Claude to
"audit `internal/user` — is this idiomatic Go?".

---

## 🇧🇷 Português

E aí! Criei uma **skill do Claude Code** chamada **`go-idiomatic`** e quis compartilhar.

**O que ela faz:** você aponta para um pacote ou arquivo Go e ela audita o código contra **12
dimensões** (71 regras concretas) — formatação, nomes, comentários, tratamento de erros, fluxo de
controle, interfaces, concorrência, structs, pacotes/globais, slices/stdlib, testes, e uma dimensão
destaque de **"Java/C#-isms"**. Depois ela exporta:

- ✅ um **relatório em markdown** com cada regra que o código atende / falha / que não se aplica
- 📋 uma **lista priorizada de próximos passos** (piores dimensões primeiro)
- 📊 uma **nota de 0 a 100** pra você rodar de novo depois das melhorias e ver o código ficar mais idiomático
- 🔧 um **cruzamento com linters** — quais falhas o `golangci-lint` pega sozinho e quais precisam de revisão humana

O destaque é pegar os **hábitos de OOP que vêm de outras linguagens**: interfaces `IUserService`,
getters `GetName()`/`SetName()`, `panic`/`recover` usados como try/catch, tipos `Abstract*`/`*Impl`,
classes `Factory`/`Builder`, constantes ALL_CAPS tipo `MAX_RETRIES`, pacotes-gaveta `util`/`manager`
e funções que retornam interfaces "pra ter flexibilidade". Coisas que um formatador nunca te conta.

É só uma pasta que você joga em `~/.claude/skills/` e funciona em qualquer projeto. As regras ficam
num único `rules.json`, a pontuação é um script Node pequenininho, e o relatório é markdown puro.

**De onde vêm as regras:** elas se baseiam nas três referências mais autoritativas de Go — o
**Effective Go** (go.dev/doc/effective_go), o oficial **Go Code Review Comments**
(go.dev/wiki/CodeReviewComments) e o **Uber Go Style Guide** (github.com/uber-go/guide). Base sólida
— mas não é sagrado. Tudo é um arquivo JSON só, então **mude, adicione, remova ou edite qualquer
regra** pra encaixar nas convenções do seu time. Deixa do seu jeito.

Quer? É de graça — copia a pasta `go-idiomatic` pra dentro de `~/.claude/skills/` e pede pro Claude
"auditar o `internal/user` — isso é Go idiomático?".
