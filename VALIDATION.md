# Validation and release record

Prepared October 28, 2026. This package is a native integration for the existing **Curated Finds Direct** service, not a generic Apify wrapper. No website server, existing workflow, account, credential or subscription was changed during package construction.

## Completed checks

- Official `npm create @n8n/node@0.54.1` scaffold, declarative/custom HTTP template; it resolved `@n8n/node-cli` 0.55.1, now pinned in this package.
- Official CLI `npm run lint` and `npm run build` pass.
- Thirteen offline semantic tests pass using `n8n-core` 2.45.4 and `n8n-workflow` 2.45.2, the published dependencies of n8n 2.45.5. The actual n8n package loader registers the node and credentials. Tests exercise native parameter/expression mapping, `RoutingNode.makeRequest`, hooks and output conversion with a mocked HTTP transport. They cover one-page mapping, empty results, no automatic next-page request, invalid inputs before transport, propagated failures, malformed response handling, secret-free defaults, the sample workflow, declared credential test, enforced search timeout and all three output modes.
- `npm run scan:local` runs the official `@n8n/scan-community-package` 0.41.1 static analyzer on source and the exact local npm tarball. Both source and packed artifact passed. Its result is saved in the ignored `.validation/scan-local.json`. This is local static analysis; it does not check an npm provenance attestation or a public GitHub repository.
- The npm allowlist contains compiled nodes/credentials, safe example JSON, README, LICENSE and this file. It excludes tests, local account data, `node_modules`, build-cache files and operator evidence.

No live API search, credential test, direct subscription lookup, model-provider request or payment was made. No hosted editor import, browser credential form or full `RoutingNode.runNode` execution is claimed by these tests. No npm package, GitHub repository, tag or n8n verification application was created by this package task. An actual product run requires the customer's direct subscription key and uses their allowance.

The local shell was Node.js 22.14.0. Build/lint/tests run successfully there, but current release tooling requires a newer supported runtime. CI and publishing use Node.js 24; use current Node 24 LTS for a fresh development installation. Local installation used `npm install --ignore-scripts` because product runtime tests do not need optional native development dependencies; the clean GitHub CI run remains a separate acceptance check.

## Runtime boundaries found during review

n8n 2.45.5's routing engine overwrites `requestDefaults.timeout` before sending. Search therefore enforces 30 seconds in its final pre-send hook, with a regression test. The native credential-test service constructs its own routing node, so its timing is controlled by n8n and can reach five minutes in this version despite the request's declared 30 seconds. Both use a fixed HTTPS destination, no redirects and a 1 MiB decoded-response limit.

The package itself does not retry or page automatically. n8n's authentication helper can retry a rejected authentication request once. Rejected credentials do not pass the direct service's lookup admission. One successful credential test uses one included lookup; n8n can invoke a new test when saving or retesting credentials. This is prominently disclosed in the credential form, README and example. The test is a real fixed search (`query=n8n`, `limit=1`, `offset=0`), not a format-only check or simulated success.

Every workflow input item and every later AI-tool invocation can use another lookup. The example sets Execute Once and disables Retry On Fail. The direct plan is hard capped at 1,000 lookups per paid period, shared with the website reader; valid empty results count. Search results preserve catalogue version, total, next offset and remaining allowance. Simplified and selected output modes retain original source/review/evidence fields.

## External publication steps

1. Create the public `myworkingmemory/n8n-nodes-curated-finds` source repository; keep npm repository/author ownership consistent. Push the prepared source and obtain passing GitHub CI.
2. Establish npm publication access for `n8n-nodes-curated-finds` and configure its GitHub Actions trusted publisher (`myworkingmemory`, `n8n-nodes-curated-finds`, `publish.yml`) or an appropriately scoped `NPM_TOKEN`. The npm package name was reported unclaimed at preparation time; availability and account authorization must be checked when publishing.
3. Publish only via the tag-triggered GitHub Action. Since May 1, 2026, n8n verification requires GitHub Actions npm provenance and a reachable public source repository. Do not claim provenance before that action has produced an attestation. Do not push a release tag until npm access is ready.
4. Run `npx @n8n/scan-community-package@0.41.1 n8n-nodes-curated-finds@0.1.0` on the published package, checking its printed verdict as well as process status. The CLI can print a failed verdict yet exit zero. The earlier `--help` attempt was interpreted as a registry package name and returned 404, so it was not a package scan.
5. Submit the package at the n8n Creator Portal Nodes section. Publication is not verification; n8n makes the final approval decision. The service supplies one clearly scoped action and public docs, with no runtime dependencies beyond the allowed n8n peer.

## Sources

- Existing service contract: https://www.myworkingmemory.ai/curated-finds-docs.html
- Existing subscription and key delivery: https://www.myworkingmemory.ai/apis
- Official CLI: https://docs.n8n.io/connect/create-nodes/build-your-node/using-the-n8n-node-tool
- Verification: https://docs.n8n.io/connect/create-nodes/build-your-node/reference/verification-guidelines
- Publishing and provenance: https://docs.n8n.io/connect/create-nodes/deploy-your-node/submit-community-nodes
- AI output modes: https://docs.n8n.io/connect/create-nodes/build-your-node/reference/ux-guidelines#ai-tool-nodes-output-parameter
- Native credential-test behaviour: https://github.com/n8n-io/n8n/blob/n8n%402.45.5/packages/cli/src/services/credentials-tester.service.ts
