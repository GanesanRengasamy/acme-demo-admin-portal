---
name: team-code-review
description: Reviews code changes against the team checklist and reports issues by severity. Use when asked to review a branch, a diff, or a pull request.
---

# Team Code Review

Review code changes against the team checklist and report findings by severity.

## When to use

Use this skill when the user asks to review a branch, a diff, or a pull request, and at the end of a milestone before merging.

## Steps

1. Compare the branch with `main` and list every changed file. Run `git diff main...HEAD --name-only` and `git diff main...HEAD --stat` from the repo root.
2. Read every changed file in full, not only the diff hunks. Use `read_file` on the post-change contents so the review sees context, not just the patch.
3. Check each change against the items in `references/checklist.md`.
4. Do not edit any source files during the review. The review is read-only.
5. Report findings grouped by severity: **Blocker**, **Should fix**, **Nice to have**.
6. Each finding must include: file, line, problem, and suggested fix.
7. End the report with one line: **Ready to merge**, **Ready to merge with fixes**, or **Not ready to merge**.

## Severity definitions

- **Blocker** — breaks correctness, security, or the build. Must fix before merge.
- **Should fix** — wrong style, missing test, or unclear behaviour. Fix before merge unless the team agrees to defer.
- **Nice to have** — small improvement. Can merge as is and follow up later.

## Output format

```
## Blocker
- `path/to/file.ts:42` — problem. Suggested fix: ...

## Should fix
- `path/to/file.ts:13` — problem. Suggested fix: ...

## Nice to have
- `path/to/file.ts:7` — problem. Suggested fix: ...

## Verdict
Ready to merge | Ready to merge with fixes | Not ready to merge
```

If the diff is clean, say so under each heading and still print the verdict line.

## References

- `references/checklist.md` — the items each change is checked against.
