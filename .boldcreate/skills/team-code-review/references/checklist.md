# Checklist

Review each change against these items:

- **Tests cover the change:** New or changed behavior has corresponding test coverage.
- **No secrets in code:** API keys, passwords, credentials, and tokens are not committed or exposed.
- **User input is validated:** Untrusted data is validated and sanitized at input boundaries.
- **Errors are handled and logged:** Exceptions and failures are caught, logged, and handled appropriately.
- **Public functions and API changes are documented:** New or modified public APIs and functions include clear documentation.
- **No unused code or debug logs:** Temporary logging, commented-out code, and dead code are removed.
- **Names follow the existing style:** Identifiers, variables, functions, and files match the codebase conventions.
