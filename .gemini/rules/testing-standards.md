# Interntrack Automated Testing Rule

When implementing any backend or frontend features during the Interntrack project, you must enforce a rigorous testing strategy:

1. **Test-Driven or Test-Accompanied:** Every new API endpoint, database model, or complex frontend component MUST include a dedicated test file accompanying it.
2. **Comprehensive Scenarios:** Do not just test "happy paths" (e.g. `200 OK`). You must actively mock and assert logic for:
   - `400 Bad Request` (Zod validation failures, missing payloads)
   - `401 Unauthorized` (Missing NextAuth session/tokens)
   - `403 Forbidden` (User attempting to modify/access another user's rows)
   - `404 Not Found` (Querying IDs that don't exist)
3. **Execution & Coverage Validation:** Upon writing tests, you must run the suite locally using `npx vitest` and verify nothing is failing. Then, execute `npm run coverage` (`vitest run --coverage`) to generate the istanbul coverage map.
4. **Coverage Standard:** Target an 80%+ coverage metric on newly created files. If a file dips below 80%, identify branch misses in the coverage table and explicitly write tests targeting those skipped paths. The only acceptable misses are deep `500 Internal Server Error` try/catch blocks where database crash mocks are superfluous.
