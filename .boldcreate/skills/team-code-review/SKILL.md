---
name: team-code-review
description: Reviews code changes against the team checklist and reports issues by severity. Use when asked to review a branch, a diff, or a pull request.
---

# Team code review

Review code changes against the team checklist and report issues by severity.

## Steps

1. **Compare the branch with main.** Determine the diff between the branch and `main`. Run `git diff main...HEAD` to inspect the full set of changes introduced by the branch.
2. **Read every changed file in full.** Read each modified or newly added file completely to understand the broader context around the changes.
3. **Check each change against references/checklist.md.** Evaluate the diff and files against each checklist item in `references/checklist.md`:
   - Tests cover the change
   - No secrets in code
   - User input is validated
   - Errors are handled and logged
   - Public functions and API changes are documented
   - No unused code or debug logs
   - Names follow the existing style
4. **Do not change any files.** Perform a read-only review. Do not apply fixes, edit source code, or modify files.
5. **Report findings.** Group findings by severity under three categories:
   - **Blocker**
   - **Should fix**
   - **Nice to have**

   For each finding, include:
   - **File**
   - **Line**
   - **Problem**
   - **Suggested fix**

   End the report with a clear statement on whether the change is ready to merge.
