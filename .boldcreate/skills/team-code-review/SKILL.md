---
name: team-code-review
description: Reviews code changes against the team checklist and reports issues by severity. Use when asked to review a branch, a diff, or a pull request.
---

# Team code review

Review code changes on a branch or pull request against the team checklist.

## Steps

1. **Compare the branch with main.** Determine the diff between the current branch and `main`. Run `git diff main...HEAD` (or the appropriate comparison against `main`) to identify all changed files and lines.
2. **Read every changed file in full.** Open and read each modified or newly added file from beginning to end to understand the full context of the changes.
3. **Check each change against the checklist.** Verify all modifications against `references/checklist.md`.
4. **Do not change any files.** Perform a read-only review. Do not modify, add, or delete any repository files during the review process.
5. **Report findings.** Group findings into three severity categories:
   - **Blocker**: Critical defects, security risks, broken functionality, or missing required tests.
   - **Should fix**: Important issues, missing error handling, input validation gaps, or style inconsistencies.
   - **Nice to have**: Minor improvements, non-critical documentation tweaks, or style refinements.

   For each finding, provide:
   - **File**: Path to the file.
   - **Line**: Line number or range.
   - **Problem**: Explanation of the issue found.
   - **Suggested fix**: Concrete recommendation to resolve the issue.

   End the review report with an explicit verdict on whether the change is ready to merge.
