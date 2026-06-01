#!/usr/bin/env node
// go-idiomatic scorer
// Reads an assessment JSON, scores it against reference/rules.json, and emits a
// markdown report listing unmet rules, next steps, a 0-100 score, and which
// failed rules a linter could auto-catch (cross-reference).
//
// Usage:
//   node scripts/score.mjs <assessment.json> [--out <report.md>]
//   node scripts/score.mjs --template <package-or-file>   # print a blank assessment skeleton
//
// Assessment JSON shape:
//   {
//     "target": "internal/user",
//     "language": "Go 1.23",
//     "assessedAt": "2026-06-01",
//     "results": { "ERR-01": { "status": "pass" }, "JCS-04": { "status": "fail", "note": "..." }, ... }
//   }
// status ∈ "pass" | "fail" | "na". Rules absent from `results` are treated as "pending".

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES = JSON.parse(readFileSync(join(__dirname, "..", "reference", "rules.json"), "utf8"));

const argv = process.argv.slice(2);

function levelFor(score) {
  for (const lvl of RULES.scoring.levels) if (score >= lvl.min) return lvl;
  return RULES.scoring.levels[RULES.scoring.levels.length - 1];
}

// ---- template mode -------------------------------------------------------
if (argv[0] === "--template") {
  const target = argv[1] || "internal/mypkg";
  const results = {};
  for (const dim of RULES.dimensions) {
    for (const r of dim.rules) results[r.id] = { status: "pending", note: "" };
  }
  const skeleton = { target, language: "Go", assessedAt: "YYYY-MM-DD", results };
  process.stdout.write(JSON.stringify(skeleton, null, 2) + "\n");
  process.exit(0);
}

const inPath = argv.find((a) => !a.startsWith("--"));
if (!inPath) {
  console.error("usage: node scripts/score.mjs <assessment.json> [--out report.md]");
  console.error("       node scripts/score.mjs --template <package-or-file>");
  process.exit(1);
}
const outIdx = argv.indexOf("--out");
const outPath = outIdx !== -1 ? argv[outIdx + 1] : inPath.replace(/\.json$/, "") + ".report.md";

const assessment = JSON.parse(readFileSync(inPath, "utf8"));
const results = assessment.results || {};

// ---- scoring -------------------------------------------------------------
const dimReports = [];
let gPass = 0, gFail = 0, gNa = 0, gPending = 0, gApplicable = 0;
const unmet = [];     // {dim, id, text, note, lint}
const pending = [];   // {dim, id, text}

for (const dim of RULES.dimensions) {
  let pass = 0, fail = 0, na = 0, pend = 0;
  for (const rule of dim.rules) {
    const entry = results[rule.id];
    const status = entry ? entry.status : "pending";
    if (status === "pass") pass++;
    else if (status === "na") na++;
    else if (status === "pending") {
      pend++;
      pending.push({ dim: dim.name, id: rule.id, text: rule.text });
    } else {
      fail++;
      unmet.push({ dim: dim.name, id: rule.id, text: rule.text, note: entry?.note || "", lint: rule.lint || null });
    }
  }
  const applicable = dim.rules.length - na;
  const score = applicable > 0 ? Math.round((pass / applicable) * 100) : 100;
  dimReports.push({ id: dim.id, name: dim.name, pass, fail, na, pend, applicable, score });
  gPass += pass; gFail += fail; gNa += na; gPending += pend; gApplicable += applicable;
}

const globalScore = gApplicable > 0 ? Math.round((gPass / gApplicable) * 100) : 100;
const totalRules = RULES.dimensions.reduce((n, d) => n + d.rules.length, 0);
const evaluated = totalRules - gPending;
const coverage = Math.round((evaluated / totalRules) * 100);
const lvl = levelFor(globalScore);

// ---- report --------------------------------------------------------------
const bar = (s) => "█".repeat(Math.round(s / 10)) + "░".repeat(10 - Math.round(s / 10));

const lines = [];
lines.push(`# Go Idiomatic Report — ${assessment.target || "(unnamed)"}`);
lines.push("");
lines.push(`> Framework: ${RULES.framework} v${RULES.version}`);
lines.push(`> Language: ${assessment.language || "Go"} · Assessed: ${assessment.assessedAt || "—"}`);
lines.push(`> Sources: ${RULES.sources.join("; ")}`);
lines.push("");
lines.push(`## Global Score: ${globalScore}/100 ${lvl.emoji} ${lvl.label}`);
lines.push("");
lines.push("```");
lines.push(`${bar(globalScore)}  ${globalScore}%`);
lines.push("```");
lines.push("");
lines.push(`- ✅ Achieved: **${gPass}**`);
lines.push(`- ❌ Not achieved: **${gFail}**`);
lines.push(`- ⏳ Pending (not evaluated): **${gPending}**`);
lines.push(`- ➖ Not applicable: **${gNa}**`);
lines.push(`- 📊 Assessment coverage: **${coverage}%** (${evaluated}/${totalRules} rules evaluated)`);
lines.push("");

lines.push("## Score by Dimension");
lines.push("");
lines.push("| Dimension | Score | Bar | ✅ | ❌ | ⏳ | ➖ |");
lines.push("|---|---:|---|---:|---:|---:|---:|");
for (const d of dimReports) {
  lines.push(`| ${d.name} | ${d.score}% | \`${bar(d.score)}\` | ${d.pass} | ${d.fail} | ${d.pend} | ${d.na} |`);
}
lines.push("");

// unmet rules grouped by dimension, with linter cross-reference
lines.push("## Rules Not Achieved");
lines.push("");
if (unmet.length === 0) {
  lines.push("_No failed rules. 🎉_");
} else {
  let curr = null;
  for (const u of unmet) {
    if (u.dim !== curr) { curr = u.dim; lines.push(`### ${u.dim}`); lines.push(""); }
    const tag = u.lint ? `  \`[auto: ${u.lint}]\`` : `  \`[manual review]\``;
    lines.push(`- ❌ **${u.id}** — ${u.text}${tag}${u.note ? `  \n  ↳ _${u.note}_` : ""}`);
  }
}
lines.push("");

// next steps: worst dimensions first
lines.push("## Next Steps");
lines.push("");
const worst = [...dimReports].filter((d) => d.fail + d.pend > 0).sort((a, b) => a.score - b.score);
if (worst.length === 0) {
  lines.push("_Everything evaluated and passing — keep running the checks on every package._");
} else {
  let step = 1;
  for (const d of worst) {
    const gap = d.fail + d.pend;
    lines.push(`${step}. **${d.name}** (${d.score}%) — resolve ${gap} rule(s) to raise this dimension's score.`);
    step++;
  }
}
lines.push("");

// linter cross-reference: which failed rules are auto-catchable
const autoFails = unmet.filter((u) => u.lint);
const manualFails = unmet.filter((u) => !u.lint);
lines.push("## Automate These (linter cross-reference)");
lines.push("");
if (autoFails.length === 0) {
  lines.push("_No failed rules are auto-catchable — all remaining work is design-level manual review._");
} else {
  const byLint = {};
  for (const u of autoFails) (byLint[u.lint] ??= []).push(u.id);
  lines.push(`${autoFails.length} of ${unmet.length} failed rules can be caught automatically. Wire these into golangci-lint / CI:`);
  lines.push("");
  lines.push("| Linter | What it catches | Failed rules |");
  lines.push("|---|---|---|");
  for (const tool of Object.keys(byLint).sort()) {
    const desc = RULES.linterLegend[tool] || "—";
    lines.push(`| \`${tool}\` | ${desc.replace(/^.*?—\s*/, "")} | ${byLint[tool].join(", ")} |`);
  }
  lines.push("");
  lines.push(`The remaining **${manualFails.length}** failure(s) need human/Claude judgment (design-level, not lint-detectable).`);
}
lines.push("");

// pending coverage callout
if (pending.length > 0) {
  lines.push("## Rules Not Yet Evaluated");
  lines.push("");
  lines.push(`There are **${pending.length}** rules without an assessment. They count as not achieved until marked. Evaluate them for a faithful score:`);
  lines.push("");
  let curr = null;
  for (const p of pending) {
    if (p.dim !== curr) { curr = p.dim; lines.push(`- _${p.dim}_: ` + p.id); }
    else lines[lines.length - 1] += `, ${p.id}`;
  }
  lines.push("");
}

lines.push("---");
lines.push(`_To track progress, re-run the assessment after fixes and compare the Global Score (${globalScore}/100)._`);
lines.push("");

writeFileSync(outPath, lines.join("\n"), "utf8");

// console summary
console.log(`Global Score: ${globalScore}/100 ${lvl.emoji} ${lvl.label}  (coverage ${coverage}%)`);
console.log(`✅ ${gPass}  ❌ ${gFail}  ⏳ ${gPending}  ➖ ${gNa}   ·   auto-catchable fails: ${autoFails.length}/${unmet.length}`);
console.log(`Report written to: ${outPath}`);
