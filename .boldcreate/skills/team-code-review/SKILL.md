---
name: team-code-review
description: Reviews code changes against the team checklist and reports issues by severity. Use when asked to review a branch, a diff, or a pull request.
---

# Team code review

Review a branch against the team checklist and report what needs attention before merge. Read-only: this skill does not modify any files.

## Steps

1. **Compare the branch with main.** Identify the change set as the diff between the current branch and `main` (or the default branch from `.boldcreate/project.yml`). Use `git diff main...HEAD --stat` to list changed files and `git diff main...HEAD` to see the changes. Run `git status`; if there are uncommitted changes, list them, say they are outside the review, and ask the user whether to commit them first. Done when the set of changed files is known.

2. **Read every changed file in full.** Open each changed file and read it completely, not just the diff hunks. The surrounding context matters: a change can be correct in isolation but break a contract the rest of the file relies on. Done when every changed file has been read end to end.

3. **Check each change against [references/checklist.md](references/checklist.md).** Walk the checklist item by item and apply each one to every change. Cite a specific file and line (or line range) for every finding. A finding without a file and line is not actionable and must not be reported. Done when every checklist item has been considered for every change.

4. **Do not change any files.** This skill is read-only. Report findings only; do not edit, commit, push, merge, or open a pull request. Hand off any fixes to the user or to another skill.

5. **Report findings grouped by severity.** Use three groups, in this order:
   - **Blocker** — must be fixed before merge (correctness, security, data loss, broken contract).
   - **Should fix** — should be addressed before merge but does not block it (missing tests for a non-trivial change, undocumented public API, etc.).
   - **Nice to have** — optional improvements (naming, comment clarity, small refactors).

   For every finding, give: **File**, **Line**, **Problem**, **Suggested fix**. If a checklist item produces no findings, say so explicitly.

6. **End with a merge verdict.** Finish the report with a single line: either `Ready to merge` or `Not ready to merge — <one sentence reason>`.

## Rules

- Never edit files from this skill. Reviewers do not fix; they report.
- Every finding must include file and line. Vague findings are dropped.
- Do not push, merge, or open a pull request from this skill.
- If there are no changed files between the branch and main, say so and stop.
