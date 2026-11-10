# Team Checklist

Check every change against these items.

- **Tests cover the change.** New behaviour has a test. A bug fix has a regression test.
- **No secrets in code.** API keys, tokens, passwords, and connection strings stay out of source and config in the repo. Read them from environment variables or a secret store.
- **User input is validated.** Every external input has a check at the boundary that rejects bad data before it reaches business logic.
- **Errors are handled and logged.** Caught errors include enough context to debug. Logging does not leak secrets or PII.
- **Public functions and API changes are documented.** JSDoc, OpenAPI, README, or comments describe the contract.
- **No unused code or debug logs.** Dead branches, commented-out code, and leftover `console.log` or `print` calls are removed.
- **Names follow the existing style.** New identifiers match the file or module they sit in.

## Severity hints

- A miss on tests, secrets, validation, error handling, or logging that affects production behaviour is a **Blocker**.
- A miss on documentation, unused code, debug logs, or naming is a **Should fix**.
- Anything cosmetic is a **Nice to have**.
