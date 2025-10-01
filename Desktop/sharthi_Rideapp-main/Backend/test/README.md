This folder contains tests for the backend models and services.

Running locally

1. Install dependencies:

```bash
npm install
```

2. Run tests:

```bash
npm test
```

Notes

- Tests use `mongodb-memory-server` so a local MongoDB instance is not required.
- Ensure `JWT_SECRET` is set in your environment or the tests set a default value.
