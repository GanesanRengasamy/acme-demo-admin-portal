# Team checklist

Apply each item to every change under review. Cite file and line for any finding.

- [ ] **Tests cover the change.** New behaviour, bug fixes, and changed contracts have tests. A change that alters control flow or public output without a test is a blocker.
- [ ] **No secrets in code.** No API keys, tokens, passwords, connection strings, or other credentials are committed. Use environment variables or a secret store. A secret in code is a blocker.
- [ ] **User input is validated.** Anything that comes from a request body, query string, header, form, URL parameter, or external system is checked for type, shape, and bounds before use. Validation lives at the trust boundary.
- [ ] **Errors are handled and logged.** Failures are caught at the right layer, do not leak internals to the caller, and are logged with enough context to diagnose. No swallowed errors, no bare `catch {}`.
- [ ] **Public functions and API changes are documented.** Exported functions, public endpoints, request/response shapes, and changed behaviour are reflected in the docs (README, API docs, JSDoc/docstrings, OpenAPI). Undocumented public surface is a Should fix.
- [ ] **No unused code or debug logs.** No dead code, commented-out blocks, or leftover `console.log` / debug prints in production paths. Stale imports and unused variables are removed.
- [ ] **Names follow the existing style.** Identifiers, file names, and module names match the conventions already used in the repository (casing, prefixes, naming patterns). Inconsistency is a Nice to have unless it actively misleads.
